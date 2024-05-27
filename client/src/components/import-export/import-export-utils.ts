import {CARDS} from 'common/cards'
import Card from 'common/cards/base/card'
import {encode, decode} from 'js-base64'

export const getDeckFromHash = (hash: string): Array<Card> => {
	try {
		var b64 = decode(hash)
			.split('')
			.map((char) => char.charCodeAt(0))
	} catch (err) {
		return []
	}
	const deck = []
	for (let i = 0; i < b64.length; i++) {
		const id = Object.values(CARDS).find((value) => value.numericId === b64[i])?.id
		if (!id) continue
		deck.push(CARDS[id])
	}
	const deckCards = deck.filter((card) => CARDS[card.id])
	return deckCards
}

export const getHashFromDeck = (pickedCards: Array<Card>): string => {
	const indicies = []
	for (let i = 0; i < pickedCards.length; i++) {
		const id = CARDS[pickedCards[i].id].numericId
		if (id >= 0) indicies.push(id)
	}
	const b64cards = encode(String.fromCharCode.apply(null, indicies))
	return b64cards
}
