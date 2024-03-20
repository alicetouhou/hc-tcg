import {CONFIG, DEBUG_CONFIG, EXPANSIONS} from '../config'
import {CARDS} from '../cards'
import {getDeckCost} from './ranks'
import {CustomSettingsT} from '../types/game-state'

export function validateDeck(deckCards: Array<string>, customSettings: CustomSettingsT) {
	if (DEBUG_CONFIG.disableDeckValidation) return
	if (customSettings.creativeMode) return

	const limits = CONFIG.limits

	const disabledExpansions = customSettings.disabledExpansions
		? customSettings.disabledExpansions
		: []
	const useLrf = customSettings.useLrf ? customSettings.useLrf : false
	const maxDuplicates =
		customSettings.maxDuplicates !== undefined ? customSettings.maxDuplicates : limits.maxDuplicates
	const maxDeckCost =
		customSettings.maxDeckCost !== undefined ? customSettings.maxDeckCost : limits.maxDeckCost
	const minCards = customSettings.minCards !== undefined ? customSettings.minCards : limits.minCards
	const maxCards = customSettings.maxCards !== undefined ? customSettings.maxCards : limits.maxCards

	deckCards = deckCards.filter((cardId) => CARDS[cardId])

	// order validation by simplest problem first, so that a player can easily identify why their deck isn't valid

	// less than one hermit
	const hasHermit = deckCards.some((cardId) => CARDS[cardId].type === 'hermit')
	if (!hasHermit) return 'Deck must have at least one Hermit.'

	// more than max duplicates
	const tooManyDuplicates =
		maxDuplicates &&
		deckCards.some((cardId) => {
			if (CARDS[cardId].type === 'item') return false
			const duplicates = deckCards.filter((filterCardId) => filterCardId === cardId)
			return duplicates.length > maxDuplicates
		})

	if (tooManyDuplicates)
		return `You cannot have more than ${maxDuplicates} duplicate cards unless they are item cards.`

	// more than max tokens
	const deckCost = getDeckCost(deckCards)
	if (!useLrf && deckCost > maxDeckCost) return `Deck cannot cost more than ${maxDeckCost} tokens.`

	// Low token rarity modes
	if (useLrf) {
		if (deckCards.filter((card) => CARDS[card].rarity === 'ultra_rare').length > 3)
			return 'Your deck cannot have more than 3 ultra rare cards.'
		if (deckCards.filter((card) => CARDS[card].rarity === 'rare').length > 12)
			return 'Your deck cannot have more than 12 rare cards.'
	}

	const exactAmount = minCards === maxCards
	const exactAmountText = `Deck must have exactly ${minCards} cards.`

	if (deckCards.length < minCards)
		return exactAmount ? exactAmountText : `Deck must have at least ${minCards} cards.`
	if (deckCards.length > maxCards)
		return exactAmount ? exactAmountText : `Deck can not have more than ${maxCards} cards.`

	// Contains disabled cards
	const disabled = disabledExpansions ? disabledExpansions : EXPANSIONS.disabled
	const hasDisabledCards = deckCards.some((cardId) =>
		disabled.includes(CARDS[cardId].getExpansion())
	)
	if (hasDisabledCards) return 'Deck must not include removed cards.'
}
