import pg from 'pg'
import QUERIES from './queries'
import {Card} from 'common/cards/base/types'
import {GameEndOutcomeT} from 'common/types/game-state'
import {Tag} from 'common/types/deck'
const {Pool} = pg

export type User = {
	uuid: string
	secret: string
	username: string
	minecraftName: string | null
}

export type UserWithoutSecret = {
	uuid: string
	username: string
	minecraftName: string | null
}

export type Deck = {
	code: string
	name: string
	icon: string
	tags: Array<string>
	cards: Array<Card>
}

export type Stats = {
	gamesPlayed: number
	wins: number
	losses: number
	ties: number
	forfeitWins: number
	forfeitLosses: number
}

export class Database {
	public pool: pg.Pool
	public allCards: Array<Card>
	private bfDepth: number

	constructor(pool: pg.Pool, allCards: Array<Card>, bfDepth: number) {
		this.pool = pool
		this.allCards = allCards
		this.bfDepth = bfDepth
	}

	public async new() {
		await this.pool.query(QUERIES.SETUP_DB)

		await this.pool.query(
			`
			INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING;
		`,
			[this.allCards.map((card) => card.numericId)],
		)
	}

	public async close() {
		await this.pool.end()
	}

	/*** Insert a user into the Database. Returns `user`. */
	public async insertUser(
		username: string,
		minecraftName: string | null,
	): Promise<User | null> {
		const secret = (await this.pool.query('SELECT * FROM uuid_generate_v4()'))
			.rows[0]['uuid_generate_v4']
		const user = await this.pool.query(
			"INSERT INTO users (username, minecraft_name, secret) values ($1,$2,crypt($3, gen_salt('bf', $4))) RETURNING (user_id)",
			[username, minecraftName, secret, this.bfDepth],
		)
		return {
			uuid: user.rows[0]['user_id'],
			secret: secret,
			username: username,
			minecraftName: minecraftName,
		}
	}

	public async authenticateUser(
		uuid: string,
		secret: string,
	): Promise<User | null> {
		const user = await this.pool.query(
			'SELECT * FROM users WHERE user_id = $1 AND secret = crypt($2, secret)',
			[uuid, secret],
		)

		if (user.rows.length === 0) return null

		return {
			uuid: user.rows[0]['user_id'],
			secret: secret,
			username: user.rows[0]['username'],
			minecraftName: user.rows[0]['minecraft_name'],
		}
	}

	/*** Insert a deck into the Database. Returns the deck code. */
	public async insertDeck(
		name: string,
		icon: string,
		cards: Array<number>,
		tagIds: Array<string>,
		user_id: string,
	): Promise<string | null> {
		const deckResult = await this.pool.query(
			'INSERT INTO decks (user_id, name, icon) values ($1,$2,$3) RETURNING (deck_code)',
			[user_id, name, icon],
		)
		const deckCode: string = deckResult.rows[0]['deck_code']

		const reformattedCards = cards.reduce(
			(r: Array<{id: number; copies: number}>, card) => {
				const index = r.findIndex((subcard) => subcard.id === card)
				if (index >= 0) {
					r[index].copies += 1
					return r
				}
				return [...r, {id: card, copies: 1}]
			},
			[],
		)

		await this.pool.query(
			`
				INSERT INTO deck_cards (deck_code,card_id,copies) SELECT * FROM UNNEST ($1::text[],$2::int[],$3::int[]) 
				ON CONFLICT DO NOTHING`,
			[
				Array(reformattedCards.length).fill(deckCode),
				reformattedCards.map((card) => card.id),
				reformattedCards.map((card) => card.copies),
			],
		)

		if (tagIds.length > 0) {
			await this.pool.query(
				'INSERT INTO deck_tags (deck_code,tag_id) SELECT * FROM UNNEST ($1::text[],$2::text[])',
				[Array(tagIds.length).fill(deckCode), tagIds],
			)
		}

		return deckCode
	}

	/** Return the deck with a specific ID. */
	public async getDeckFromID(deckCode: string): Promise<Deck | null> {
		const deck = (
			await this.pool.query(
				`SELECT * FROM decks
					LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
					LEFT JOIN deck_tags ON decks.deck_code = deck_tags.deck_code
					WHERE decks.deck_code = $1
					`,
				[deckCode],
			)
		).rows
		const code = deck[0]['deck_code']
		const name = deck[0]['name']
		const icon = deck[0]['icon']
		const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
			if (r.find((card) => card.numericId === row['card_id'])) return r
			return [
				...r,
				...Array(row['copies']).fill(
					this.allCards.find((card) => card.numericId === row['card_id']),
				),
			]
		}, [])
		const tags: Array<string> = deck.reduce((r: Array<string>, row) => {
			if (r.includes(row['tag_id'])) return r
			return [...r, row['tag_id']]
		}, [])

		return {
			code,
			name,
			icon,
			cards,
			tags,
		}
	}

	// This function is horribly written, need to redo it
	/** Return the decks associated with a user. */
	public async getDecks(uuid: string): Promise<Array<Deck | null>> {
		const decks = await this.pool.query(
			'SELECT (code) FROM decks WHERE user_id = $1',
			[uuid],
		)
		const allDecks: Array<Deck | null> = []
		for (let i = 0; i < decks.rows.length; i++) {
			allDecks.push(await this.getDeckFromID(decks.rows[i]['deck_code']))
		}
		return allDecks
	}

	/** Disassociate a deck from a user. This is used when a deck is deleted or updated.*/
	public async disassociateDeck(
		deckCode: string,
		user_id: string,
	): Promise<void> {
		await this.pool.query(
			'UPDATE decks SET user_id = NULL WHERE deck_code = $1 AND user_id = $2',
			[deckCode, user_id],
		)
	}

	/*** Insert a tag into the Database. Returns the tag code. */
	public async insertTag(
		uuid: string,
		tagName: string,
		tagColor: string,
	): Promise<Tag | null> {
		const tag = await this.pool.query(
			'INSERT INTO user_tags (user_id, name, color) values ($1,$2,$3) RETURNING tag_id,name,color',
			[uuid, tagName, tagColor],
		)

		return {
			name: tag.rows[0]['name'],
			color: tag.rows[0]['color'],
			key: tag.rows[0]['tag_id'],
		}
	}

	/** Delete a tag from a user. */
	public async deleteTag(uuid: string, tagId: string): Promise<void> {
		await this.pool.query(
			'DELETE FROM user_tags USING deck_tags WHERE tag_id = $1 user_id = $2',
			[tagId, uuid],
		)
	}

	/**Get tags a user has created */
	public async getTags(uuid: string): Promise<Array<Tag>> {
		const tags = await this.pool.query(
			'SELECT tag_id,name,color FROM user_tags WHERE user_id = $1',
			[uuid],
		)

		return tags.rows.map((row) => ({
			name: row['name'],
			color: row['color'],
			key: row['tag_id'],
		}))
	}

	/**Get a user's stats */
	public async getUserStats(uuid: string): Promise<Stats | null> {
		const stats = await this.pool.query(
			`
			SELECT 
			(SELECT count(*) FROM games WHERE winner = $1 AND outcome='player_won') as wins,
			(SELECT count(*) FROM games WHERE loser = $1 AND outcome='player_won') as losses,
			(SELECT count(*) FROM games WHERE winner = $1 AND outcome='forfeit') as forfeit_wins,
			(SELECT count(*) FROM games WHERE loser = $1 AND outcome='forfeit') as forfeit_losses,
			(SELECT count(*) FROM games WHERE winner = $1 OR loser = $1) as total,
			(SELECT count(*) FROM games WHERE (winner = $1 OR loser = $1) 
				AND outcome != 'player_won' AND outcome != 'forfeit') as ties
			`,
			[uuid],
		)

		const statRows = stats.rows[0]

		return {
			gamesPlayed: Number(statRows['total']),
			wins: Number(statRows['wins']),
			losses: Number(statRows['losses']),
			forfeitWins: Number(statRows['forfeit_wins']),
			forfeitLosses: Number(statRows['forfeit_losses']),
			ties: Number(statRows['ties']),
		}
	}

	/**Get a deck's stats */
	public async getDeckStats(code: string): Promise<Stats | null> {
		const stats = await this.pool.query(
			`
			SELECT 
			(SELECT count(*) FROM games WHERE winner_deck_code = $1 AND outcome='player_won') as wins,
			(SELECT count(*) FROM games WHERE loser_deck_code = $1 AND outcome='player_won') as losses,
			(SELECT count(*) FROM games WHERE winner_deck_code = $1 AND outcome='forfeit') as forfeit_wins,
			(SELECT count(*) FROM games WHERE loser_deck_code = $1 AND outcome='forfeit') as forfeit_losses,
			(SELECT count(*) FROM games WHERE winner_deck_code = $1 OR loser_deck_code = $1) as total,
			(SELECT count(*) FROM games WHERE (winner_deck_code = $1 OR loser_deck_code = $1) 
				AND outcome != 'player_won' AND outcome != 'forfeit') as ties
			`,
			[code],
		)

		const statRows = stats.rows[0]

		return {
			gamesPlayed: Number(statRows['total']),
			wins: Number(statRows['wins']),
			losses: Number(statRows['losses']),
			forfeitWins: Number(statRows['forfeit_wins']),
			forfeitLosses: Number(statRows['forfeit_losses']),
			ties: Number(statRows['ties']),
		}
	}

	/** Returns a user's username and minecraft name from their UUID*/
	public async getUserInfo(uuid: string): Promise<UserWithoutSecret | null> {
		const user = await this.pool.query(
			'SELECT user_id,username,minecraft_name FROM users WHERE user_id = $1',
			[uuid],
		)

		if (user.rows.length === 0) return null

		return {
			uuid: user.rows[0]['user_id'],
			username: user.rows[0]['username'],
			minecraftName: user.rows[0]['minecraft_name'],
		}
	}

	/**Set a user's username */
	public async setUsername(uuid: string, newUsername: string): Promise<void> {
		await this.pool.query('UPDATE users SET username = $1 WHERE user_id = $2', [
			newUsername,
			uuid,
		])
	}

	/**Set a user's minecraft name */
	public async setMinecraftName(
		uuid: string,
		newMinecraftName: string,
	): Promise<void> {
		await this.pool.query(
			'UPDATE users SET minecraft_name = $1 WHERE user_id = $2',
			[newMinecraftName, uuid],
		)
	}

	/** Insert a game into the database */
	public async insertGame(
		firstPlayerDeckCode: string,
		secondPlayerDeckCode: string,
		firstPlayerUuid: string,
		secondPlayerUuid: string,
		outcome: GameEndOutcomeT,
		winningPlayerUuid: string | null,
	): Promise<void> {
		let winner
		let winningDeck
		let loser
		let losingDeck

		if (winningPlayerUuid && winningPlayerUuid === firstPlayerUuid) {
			winner = firstPlayerUuid
			winningDeck = firstPlayerDeckCode
			loser = secondPlayerUuid
			losingDeck = secondPlayerDeckCode
		} else {
			winner = secondPlayerUuid
			winningDeck = secondPlayerDeckCode
			loser = firstPlayerUuid
			losingDeck = firstPlayerDeckCode
		}

		await this.pool.query(
			"INSERT INTO games (game_time, winner, loser, winner_deck_code, loser_deck_code, outcome) VALUES('now',$1,$2,$3,$4,$5)",
			[winner, loser, winningDeck, losingDeck, outcome],
		)
	}
}

export const setupDatabase = (
	allCards: Array<Card>,
	env: any,
	bfDepth: number,
) => {
	const pool = new Pool({
		host: env.POSTGRES_HOST,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		database: env.POSTGRES_DATABASE,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	return new Database(pool, allCards, bfDepth)
}
