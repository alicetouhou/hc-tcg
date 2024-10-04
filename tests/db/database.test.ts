import {afterAll, beforeAll, describe, expect, test} from '@jest/globals'
import {CARDS_LIST} from 'common/cards'
import {config} from 'dotenv'
import {Database, setupDatabase} from 'server/db/db'

describe('Test Database', () => {
	let database: Database

	beforeAll(async () => {
		const env = config()
		database = setupDatabase(CARDS_LIST, {
			...{
				POSTGRES_DATABASE: 'hctcg',
				POSTGRES_USER: 'hctcg',
				POSTGRES_PASSWORD: 'hctcg',
				POSTGRES_HOST: 'localhost',
				POSTGRES_PORT: '5432',
			},
			...process.env,
			...env,
		})
		return database.new()
	})

	afterAll(async () => {
		database.close()
	})

	test('Add user', async () => {
		const user = await database.insertUser('Test User', 'ethoslab', 4)
		expect(user).not.toBeNull()
		expect(user?.username).toBe('Test User')
		expect(user?.minecraftName).toBe('ethoslab')
		expect(user?.uuid).toBeTruthy()
		expect(user?.secret).toBeTruthy()
		expect(typeof user?.uuid === 'string').toBeTruthy()
		expect(typeof user?.secret === 'string').toBeTruthy()
	})

	test('Add deck', async () => {
		const user = await database.insertUser('Test User', 'ethoslab', 4)
		const playerDeck = {
			name: 'Testing deck',
			icon: 'balanced',
			cards: [1, 2, 2, 3, 4, 4, 5, 4],
			tags: [],
		}

		let code: string | null = null

		expect(code).not.toBeNull()

		if (user) {
			code = await database.insertDeck(
				playerDeck.name,
				playerDeck.icon,
				playerDeck.cards,
				playerDeck.tags,
				user.uuid,
			)
		}

		if (code) {
			expect(typeof code === 'string').toBeTruthy()

			const returnedDeck = await database.getDeckFromID(code)
			expect(returnedDeck).not.toBeNull()

			expect(returnedDeck?.name).toBe('Testing deck')
			expect(returnedDeck?.icon).toBe('balanced')

			expect(
				returnedDeck?.cards.filter((card) => card.numericId === 1).length,
			).toEqual(1)
			expect(
				returnedDeck?.cards.filter((card) => card.numericId === 2).length,
			).toEqual(2)
			expect(
				returnedDeck?.cards.filter((card) => card.numericId === 3).length,
			).toEqual(1)
			expect(
				returnedDeck?.cards.filter((card) => card.numericId === 4).length,
			).toEqual(3)
			expect(
				returnedDeck?.cards.filter((card) => card.numericId === 5).length,
			).toEqual(1)
		}
	})
})
