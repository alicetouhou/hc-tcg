import {CARDS} from 'common/cards'
import {PlayerDeckT, StoredDeckT} from 'common/types/deck'
import {validateDeck} from 'common/utils/validation'

export const getActiveDeckName = () => {
	return localStorage.getItem('activeDeck')
}

export const setActiveDeck = (name: string) => {
	localStorage.setItem('activeDeck', name)
}

export const isActiveDeckValid = () => {
	const activeDeckName = getActiveDeckName()
	const activeDeck = activeDeckName
		? getSavedDeck(activeDeckName)?.cards.map((card) => card.id)
		: null
	const activeDeckValid = !!activeDeck && !validateDeck(activeDeck)
	return activeDeckValid
}

export const getSavedDeck = (name: string) => {
	const hash = localStorage.getItem('Deck_' + name)

	if (hash === null) return

	const loadedDeck: StoredDeckT = JSON.parse(hash)

	const deck = {
		name: loadedDeck.name,
		icon: loadedDeck.icon,
		cards: loadedDeck.cards.map((card) => CARDS[card.cardId]),
	}

	return deck
}

export const saveDeck = (deck: PlayerDeckT) => {
	const hash = 'Deck_' + deck.name
	const storedDeck: StoredDeckT = {
		name: deck.name,
		icon: deck.icon,
		cards: deck.cards.map((card) => ({cardId: card.id, instance: card.instance})),
	}
	localStorage.setItem(hash, JSON.stringify(storedDeck))
}

export const deleteDeck = (name: string) => {
	const hash = 'Deck_' + name
	localStorage.removeItem(hash)
}

export const getSavedDecks = () => {
	let lsKey
	const decks = []

	for (let i = 0; i < localStorage.length; i++) {
		lsKey = localStorage.key(i)

		if (lsKey?.includes('Deck_')) {
			const key = localStorage.getItem(lsKey)
			decks.push(key || '')
		}
	}
	return decks.sort()
}

export const getSavedDeckNames = () => {
	return getSavedDecks().map((name) => JSON.parse(name || '')?.name || '')
}

export const getLegacyDecks = () => {
	for (let i = 0; i < localStorage.length; i++) {
		const lsKey = localStorage.key(i)

		if (lsKey?.includes('Loadout_')) return true
	}
	return false
}
export const convertLegacyDecks = (): number => {
	let conversionCount = 0
	for (let i = 0; i < localStorage.length; i++) {
		const lsKey = localStorage.key(i)

		if (lsKey?.includes('Loadout_')) {
			conversionCount = conversionCount + 1
			const legacyName = lsKey.replace('Loadout_', '[Legacy] ')
			const legacyDeck = localStorage.getItem(lsKey)

			const convertedDeck = {
				name: legacyName,
				icon: 'any',
				cards: JSON.parse(legacyDeck || ''),
			}

			localStorage.setItem(`Deck_${legacyName}`, JSON.stringify(convertedDeck))

			localStorage.removeItem(lsKey)
			console.log(`Converted deck:`, lsKey, legacyName)
		}
	}

	return conversionCount
}
