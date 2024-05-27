import {CARDS, EFFECT_CARDS} from '../cards'
import {CardTypeT, RankT} from '../types/cards'
import Card from '../cards/base/card'

/**
 * Returns true if the two cards are equal
 */
export function equalCard(card1: Card | null, card2: Card | null) {
	if (!card1 && !card2) return true
	if (!card1 || !card2) return false
	return card1.id === card2.id && card1.instance === card2.instance
}

/**
 * Check if card is the type of card
 */
export function isCardType(card: Card | null, type: CardTypeT): boolean {
	if (!card) return false
	const cardInfo = CARDS[card.id]
	return cardInfo.type === type
}

export const isRemovable = (card: Card) => {
	const cardInfo = EFFECT_CARDS[card.id]
	if (!cardInfo) return false
	return cardInfo.getIsRemovable()
}

export function getCardExpansion(id: string) {
	let expansion: string = CARDS[id].getExpansion()

	return expansion
}
