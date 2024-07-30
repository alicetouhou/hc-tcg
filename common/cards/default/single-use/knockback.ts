import {GameModel} from '../../../models/game-model'
import query from '../../../components/query'
import {CardComponent, ObserverComponent, SlotComponent} from '../../../components'
import {applySingleUse} from '../../../utils/board'
import Card from '../../base/card'
import {SingleUse} from '../../base/types'
import {singleUse} from '../../base/defaults'

class Knockback extends Card {
	pickCondition = query.every(
		query.slot.opponent,
		query.slot.hermit,
		query.not(query.slot.active),
		query.not(query.slot.empty)
	)

	props: SingleUse = {
		...singleUse,
		id: 'knockback',
		numericId: 73,
		name: 'Knockback',
		expansion: 'default',
		rarity: 'rare',
		tokens: 0,
		description:
			'After your attack, your opponent must choose an AFK Hermit to set as their active Hermit, unless they have no AFK Hermits.',
		log: (values) => `${values.defaultLog} with {your|their} attack`,
		attachCondition: query.every(
			singleUse.attachCondition,
			query.exists(SlotComponent, this.pickCondition)
		),
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.afterAttack, (_attack) => {
			applySingleUse(game)
			// Only Apply this for the first attack
			observer.unsubscribe(player.hooks.afterAttack)
		})

		observer.subscribe(player.hooks.onApply, () => {
			if (!game.components.exists(SlotComponent, this.pickCondition)) return

			let knockbackRequest = opponentPlayer.createKnockbackPickRequest(component)
			if (knockbackRequest) game.addPickRequest(knockbackRequest)
		})
	}
}

export default Knockback
