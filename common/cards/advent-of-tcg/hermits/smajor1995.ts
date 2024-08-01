import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {
	CardComponent,
	ObserverComponent,
	SlotComponent,
	StatusEffectComponent,
} from '../../../components'
import DyedEffect from '../../../status-effects/dyed'

class Smajor1995Rare extends Card {
	props: Hermit = {
		...hermit,
		id: 'smajor1995_rare',
		numericId: 218,
		name: 'Scott',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 0,
		type: 'builder',
		health: 270,
		primary: {
			name: 'Color Splash',
			cost: ['any'],
			damage: 30,
			power: null,
		},
		secondary: {
			name: 'To Dye For',
			cost: ['any', 'any', 'any'],
			damage: 70,
			power: 'After your attack, select one of your AFK Hermits to use items of any type.',
		},
	}

	public override onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent
	): void {
		const {player} = component

		observer.subscribe(player.hooks.afterAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const pickCondition = query.every(
				query.slot.currentPlayer,
				query.slot.hermit,
				query.not(query.slot.active),
				query.not(query.slot.empty)
			)

			if (!game.components.exists(SlotComponent, pickCondition)) return

			game.addPickRequest({
				playerId: player.id,
				id: component.entity,
				message: 'Choose an AFK Hermit to dye.',
				canPick: pickCondition,
				onResult(pickedSlot) {
					const pickedCard = pickedSlot.getCard()
					if (!pickedCard) return

					game.components
						.new(StatusEffectComponent, DyedEffect, component.entity)
						.apply(pickedCard.entity)
				},
			})
		})
	}
}

export default Smajor1995Rare
