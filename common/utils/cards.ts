import {CARDS} from '../cards'
import {CardTypeT} from '../types/cards'
import Card from '../cards/base/card'
import EffectCard from '../cards/base/effect-card'

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
//@TODO Remove these functions
export function isCardType(card: Card | null, type: CardTypeT): boolean {
	return card?.type === type
}

export const isRemovable = (card: EffectCard) => {
	return card?.getIsRemovable()
}

export function getCardExpansion(id: string) {
	let expansion: string = CARDS[id].getExpansion()

	return expansion
}
