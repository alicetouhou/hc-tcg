import {CONFIG, DEBUG_CONFIG, EXPANSIONS} from '../config'
import {CARDS} from '../cards'

export function validateDeck(deckCards: Array<string>) {
	if (DEBUG_CONFIG.disableDeckValidation) return

	const limits = CONFIG.limits
	deckCards = deckCards.filter((cardId) => CARDS[cardId])

	// order validation by simplest problem first, so that a player can easily identify why their deck isn't valid

	// Contains disabled cards
	const hasDisabledCards = deckCards.some((cardId) =>
		EXPANSIONS.disabled.includes(CARDS[cardId].getExpansion())
	)
	if (hasDisabledCards) return 'Deck must not include removed cards.'

	// less/more than one hermit
	const hermitNumber = deckCards.reduce((sum, cardId) => {
		if (CARDS[cardId].type === 'hermit') return (sum += 1)
		return sum
	}, 0)

	if (hermitNumber !== 1) return 'Deck must have exactly one Hermit.'

	// more than max duplicates
	const tooManyDuplicates =
		limits.maxDuplicates &&
		deckCards.some((cardId) => {
			if (CARDS[cardId].type === 'item') return false
			const duplicates = deckCards.filter((filterCardId) => filterCardId === cardId)
			return duplicates.length > limits.maxDuplicates
		})

	if (tooManyDuplicates)
		return `You cannot have more than ${limits.maxDuplicates} duplicate cards unless they are item cards.`

	if (deckCards.filter((card) => CARDS[card].rarity === 'ultra_rare').length > 1)
		return 'Your deck cannot have more than 1 ultra rare card.'

	if (deckCards.filter((card) => CARDS[card].rarity === 'rare').length > 2)
		return 'Your deck cannot have more than 2 rare cards.'

	const exactAmount = limits.minCards === limits.maxCards
	const exactAmountText = `Deck must have exactly ${limits.minCards} cards.`

	if (deckCards.length < limits.minCards)
		return exactAmount ? exactAmountText : `Deck must have at least ${limits.minCards} cards.`
	if (deckCards.length > limits.maxCards)
		return exactAmount ? exactAmountText : `Deck can not have more than ${limits.maxCards} cards.`
}
