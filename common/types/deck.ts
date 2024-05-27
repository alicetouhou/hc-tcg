import Card from '../cards/base/card'

export type PlayerDeckT = {
	name: string
	icon:
		| 'any'
		| 'balanced'
		| 'builder'
		| 'explorer'
		| 'farm'
		| 'miner'
		| 'prankster'
		| 'pvp'
		| 'redstone'
		| 'speedrunner'
		| 'terraform'
	cards: Array<Card>
}

// Needed so old decks wont break. Only used on front end
export type DeckCardT = {
	instance: string
	cardId: string
}

export type StoredDeckT = {
	name: PlayerDeckT['name']
	icon: PlayerDeckT['icon']
	cards: Array<DeckCardT>
}
