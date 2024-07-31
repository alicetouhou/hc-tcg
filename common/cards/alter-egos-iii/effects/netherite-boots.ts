import {GameModel} from '../../../models/game-model'
import {CardComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {Attach} from '../../base/types'
import {attach} from '../../base/defaults'
import FireEffect from '../../../status-effects/fire'

class NetheriteBoots extends Card {
	props: Attach = {
		...attach,
		id: 'netherite_boots',
		numericId: 187,
		name: 'Netherite Boots',
		expansion: 'alter_egos_iii',
		rarity: 'ultra_rare',
		tokens: 3,
		description:
			'When the Hermit this card is attached to takes damage, that damage is reduced by up to 20hp each turn. Also prevents any damage from effect cards and any damage redirected by effect cards, and any damage from Burn. Opponent can not make this Hermit go AFK.',
		sidebarDescriptions: [
			{
				type: 'statusEffect',
				name: 'fire',
			},
		],
	}

	override onAttach(_game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player, opponentPlayer} = component

		let damageBlocked = 0

		observer.subscribe(player.hooks.getImmuneToKnockback, () => {
			return component.slot.inRow() && component.slot.rowEntity == player.activeRowEntity
		})

		observer.subscribe(player.hooks.onDefence, (attack) => {
			if (
				!attack.isTargeting(component) ||
				(attack.isType('status-effect') && !(attack.attacker instanceof FireEffect))
			) {
				attack.multiplyDamage(component.entity, 0)
				return
			}

			if (attack.attacker instanceof CardComponent) {
				if (attack.attacker.isSingleUse() || attack.attacker.isAttach()) {
					attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
				}
			}

			let suRedirect = false

			const lastTargetChange = attack.getHistory('redirect').pop()
			if (lastTargetChange) {
				suRedirect = true
			}

			if (attack.isType('effect') || suRedirect) {
				attack.multiplyDamage(component.entity, 0).lockDamage(component.entity)
			}

			if (damageBlocked < 20) {
				const damageReduction = Math.min(attack.calculateDamage(), 20 - damageBlocked)
				damageBlocked += damageReduction
				attack.reduceDamage(component.entity, damageReduction)
			}
		})

		const resetCounter = () => {
			damageBlocked = 0
		}

		// Reset counter at the start of every turn
		observer.subscribe(player.hooks.onTurnStart, resetCounter)
		observer.subscribe(opponentPlayer.hooks.onTurnStart, resetCounter)
	}
}

export default NetheriteBoots
