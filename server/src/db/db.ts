import pg from 'pg'
import QUERIES from './queries'
import {Card} from 'common/cards/base/types'
const {Pool} = pg

export type User = {
	uuid: string
	secret: string
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

export class Database {
	public pool: pg.Pool
	public allCards: Array<Card>

	constructor(pool: pg.Pool, allCards: Array<Card>) {
		this.pool = pool
		this.allCards = allCards
	}

	public new() {
		this.pool.query(QUERIES.SETUP_DB)

		this.pool.query(
			`
			INSERT INTO cards (card_id) SELECT * FROM UNNEST ($1::int[]) ON CONFLICT DO NOTHING;
		`,
			this.allCards.map((card) => card.numericId),
		)
	}

	public async close() {
		await this.pool.end()
	}

	/*** Insert a user into the Database. Returns `user`. */
	public async insertUser(
		username: string,
		minecraftName: string | null,
		bfDepth: number,
	): Promise<User | null> {
		try {
			const secret = (await this.pool.query('SELECT * FROM uuid_generate_v4()'))
				.rows[0]['uuid_generate_v4']
			const user = await this.pool.query(
				"INSERT INTO users (username, minecraft_name, secret) values ($1,$2,crypt($3, gen_salt('bf', $4))) RETURNING (user_id)",
				[username, minecraftName, secret, bfDepth],
			)
			console.log(user)
			return {
				uuid: user.rows[0]['user_id'],
				secret: secret,
				username: username,
				minecraftName: minecraftName,
			}
		} catch (err) {
			console.log(err)
			return null
		}
	}

	/*** Insert a deck into the Database. Returns the deck code. */
	public async insertDeck(
		name: string,
		icon: string,
		cards: Array<number>,
		tags: Array<string>,
		user_id: string,
	): Promise<string | null> {
		try {
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
			return deckCode
		} catch (err) {
			console.log(err)
			return null
		}
	}

	/** Return the deck with a specific ID. */
	public async getDeckFromID(deckCode: string): Promise<Deck | null> {
		try {
			const deck = (
				await this.pool.query(
					`SELECT * FROM decks
					LEFT JOIN deck_cards ON decks.deck_code = deck_cards.deck_code
					WHERE decks.deck_code = $1
					`,
					[deckCode],
				)
			).rows
			const code = deck[0]['deck_code']
			const name = deck[0]['name']
			const icon = deck[0]['icon']
			const cards: Array<Card> = deck.reduce((r: Array<Card>, row) => {
				return [
					...r,
					...Array(row['copies']).fill(
						this.allCards.find((card) => card.numericId === row['card_id']),
					),
				]
			}, [])
			const tags: Array<string> = []

			return {
				code,
				name,
				icon,
				cards,
				tags,
			}
		} catch (err) {
			console.log(err)
			return null
		}
	}

	// This function is horribly written, need to redo it
	/** Return the decks associated with a user. */
	public async getDecks(user_id: string): Promise<Array<Deck | null>> {
		try {
			const decks = await this.pool.query(
				'SELECT (code) FROM decks WHERE user_id = $1',
				[user_id],
			)
			const allDecks: Array<Deck | null> = []
			for (let i = 0; i < decks.rows.length; i++) {
				allDecks.push(await this.getDeckFromID(decks.rows[i]['deck_code']))
			}
			return allDecks
		} catch (err) {
			console.log(err)
			return []
		}
	}
	/** Disassociate a deck from a user. This is used when a deck is deleted or updated.*/
	public async disassociateDeck(
		deckCode: string,
		user_id: string,
	): Promise<void> {
		try {
			await this.pool.query(
				'UPDATE decks SET user_id = NULL WHERE deck_code = $1 AND user_id = $2',
				[deckCode, user_id],
			)
		} catch (err) {
			console.log(err)
		}
	}
	// Insert tag
	// Delete tag
	// Get tags
	// Get user stats
	// Get deck stats
	// Get user info
	// Set user info
}

export const setupDatabase = (allCards: Array<Card>, env: any) => {
	const pool = new Pool({
		host: env.POSTGRES_HOST,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		database: env.POSTGRES_DATABASE,
		max: 10,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
	})

	return new Database(pool, allCards)
}
