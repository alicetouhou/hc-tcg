import {CardComponent, ObserverComponent} from '../../../components'
import {GameModel} from '../../../models/game-model'
import Card, {InstancedValue} from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import * as query from '../../../components/query'
import {ObserverEntity} from '../../../entities'

class WormManRare extends Card {
	props: Hermit = {
		...hermit,
		id: 'wormman_rare',
		numericId: 240,
		name: 'Worm Man',
		expansion: 'alter_egos_iii',
		background: 'alter_egos',
		palette: 'alter_egos',
		rarity: 'rare',
		tokens: 1,
		type: 'prankster',
		health: 260,
		primary: {
			name: 'Side Kick',
			cost: ['prankster'],
			damage: 50,
			power: null,
		},
		secondary: {
			name: 'Total Anonymity',
			shortName: 'T. Anonymity',
			cost: ['prankster', 'prankster', 'any'],
			damage: 90,
			power:
				"At the end of your turn, you can choose to take a Hermit card from your hand and place it face down on an AFK slot. When Worm Man is knocked out, this card becomes active, or it's info needs to be shown, it is revealed.",
		},
	}

	observers = new InstancedValue<Array<ObserverEntity>>(() => [])

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			game.removeBlockedActions('game', 'PLAY_HERMIT_CARD')

			observer.subscribe(player.hooks.onAttach, (attachedComponent) => {
				game.addBlockedActions(this.props.id, 'PLAY_HERMIT_CARD')
				attachedComponent.turnedOver = true

				const newObserver = game.components.new(ObserverComponent, attachedComponent.entity)
				this.observers.set(component, [...this.observers.get(component), newObserver.entity])

				newObserver.subscribe(
					player.hooks.onActiveRowChange,
					(oldActiveHermit, newActiveHermit) => {
						if (newActiveHermit.entity !== attachedComponent.entity) return
						attachedComponent.turnedOver = false
						newObserver.unsubscribe(player.hooks.freezeSlots)
					}
				)

				observer.unsubscribe(player.hooks.onAttach)
			})
		})

		observer.subscribe(player.hooks.onTurnEnd, () => {
			observer.unsubscribe(player.hooks.onAttach)
		})
	}

	override onDetach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player} = component

		this.observers.get(component).forEach((observerEntity) => {
			const observer = game.components.get(observerEntity)
			if (!observer) return
			observer.unsubscribe(player.hooks.onActiveRowChange)

			const attachedCard = game.components.get(observer.wrappingEntity)
			if (!attachedCard || !(attachedCard instanceof CardComponent)) return
			attachedCard.turnedOver = false
		})
	}
}

export default WormManRare
