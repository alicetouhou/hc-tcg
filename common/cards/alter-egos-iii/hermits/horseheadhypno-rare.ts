import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import Clock from '../../default/single-use/clock'

class HorseHeadHypnoRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'horseheadhypno_rare',
		numericId: 158,
		name: 'Horse Head Hypno',
		shortName: 'H. H. Hypno',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'builder',
		health: 260,
		primary: {
			name: 'Nice Guy',
			cost: ['builder'],
			damage: 60,
			power: null,
		},
		secondary: {
			name: 'Restock',
			cost: ['builder', 'builder', 'any'],
			damage: 90,
			power: 'After this attack, return any 1 discarded item card to your hand.',
		},
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const pickCondition = query.every(
				query.card.currentPlayer,
				query.card.slot(query.slot.discardPile),
				query.card.isItem
			)

			if (!game.components.exists(CardComponent, pickCondition)) return

			game.addModalRequest({
				playerId: player.id,
				data: {
					modalId: 'selectCards',
					payload: {
						modalName: 'Horse Head Hypno: Choose an item card to retrieve from your discard pile.',
						modalDescription: '',
						cards: game.components.filter(CardComponent, pickCondition).map((card) => card.entity),
						selectionSize: 1,
						primaryButton: {
							text: 'Confirm Selection',
							variant: 'default',
						},
						secondaryButton: {
							text: 'Cancel',
							variant: 'default',
						},
					},
				},
				onResult(modalResult) {
					if (!modalResult?.result) return 'SUCCESS'
					if (!modalResult.cards) return 'FAILURE_INVALID_DATA'
					if (modalResult.cards.length !== 1) return 'FAILURE_CANNOT_COMPLETE'

					let card = game.components.get(modalResult.cards[0].entity)
					card?.draw()

					return 'SUCCESS'
				},
				onTimeout() {
					// Do nothing
				},
			})
		})
	}
}

export default HorseHeadHypnoRare
