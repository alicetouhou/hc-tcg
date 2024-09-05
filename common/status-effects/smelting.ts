import {
	CardComponent,
	ObserverComponent,
	StatusEffectComponent,
} from '../components'
import {GameModel} from '../models/game-model'
import {Counter, statusEffect} from './status-effect'

const SmeltingEffect: Counter<CardComponent> = {
	...statusEffect,
	id: 'smelting',
	icon: 'smelting',
	name: 'Smelting',
	description:
		'When the counter reaches 0, upgrades all item cards attached to this Hermit to double items',
	counter: 4,
	counterType: 'turns',
	onApply(
		game: GameModel,
		effect: StatusEffectComponent<CardComponent>,
		target: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = target

		if (!effect.counter) effect.counter = this.counter

		observer.subscribe(player.hooks.onTurnStart, () => {
			if (effect.counter === null) return
			effect.counter -= 1
			if (effect.counter === 0) {
				if (target.slot.inRow()) {
					target.slot.row.getItems().forEach((item) => {
						if (item.isItem() && item.props.id.includes('common')) {
							// Create a new double item and delete the old single item
							game.components.new(
								CardComponent,
								item.props.id.replace('common', 'rare'),
								item.slotEntity,
							)
							game.components.delete(item.entity)
						}
					})
				}
				target.discard()
			}
		})
	},
}

export default SmeltingEffect
