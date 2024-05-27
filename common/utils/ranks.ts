import {RANKS} from '../config'
import {RankT} from '../types/cards'
import Card from '../cards/base/card'
import {CARDS} from '../cards'

export function getCardRank(id: string): RankT {
	let rank: RankT = {name: 'stone', cost: 0}
	if ((RANKS as Record<string, any>)[id]) {
		rank.cost = (RANKS as Record<string, any>)[id]

		const rankKeys = Object.keys(RANKS.ranks)
		const rankValues = Object.values(RANKS.ranks)
		for (let i = 0; i < rankKeys.length; i++) {
			const key = rankKeys[i]
			const values = rankValues[i]
			if (values.includes(rank.cost)) rank.name = key
		}
	}
	return rank
}

export function getCardCost(card: Card) {
	const rank = getCardRank(card.id)
	return rank.cost
}

export function getDeckCost(deckCards: Array<string>) {
	let tokenCost = 0

	deckCards = deckCards.filter((id) => CARDS[id])

	deckCards.forEach((id) => {
		tokenCost += getCardCost(CARDS[id])
	})

	return tokenCost
}
