import {AttackModel} from '../../../models/attack-model'
import {CardPosModel, getCardPos} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {isTargetingPos} from '../../../utils/attacks'
import EffectCard from '../../base/effect-card'

class ThornsEffectCard extends EffectCard {
	constructor() {
		super({
			id: 'thorns',
			numericId: 96,
			name: 'Thorns',
			rarity: 'common',
			description:
				"When the Hermit this card is attached to takes damage, your opponent's active Hermit takes 20hp damage.\nIgnores armour.",
		})
	}
	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')

		// Only when the opponent attacks us
		opponentPlayer.hooks.afterAttack.add(instance, (attack) => {
			// If we have already triggered once this turn do not do so again
			if (player.custom[triggeredKey]) return

			if (!attack.isType('primary', 'secondary', 'effect') || attack.isBacklash) return
			// Only return a backlash attack if the attack did damage
			if (attack.calculateDamage() <= 0) return

			if (attack.getAttacker() && isTargetingPos(attack, pos)) {
				player.custom[triggeredKey] = true

				const backlashAttack = new AttackModel({
					game: game,
					creator: pos.card,
					attacker: attack.getAttacker()?.card,
					target: attack.getAttacker()?.card,
					type: 'effect',
					isBacklash: true,
					log: (values) => `${values.target} took ${values.damage} damage from $eThorns II$`,
				}).addDamage(this.id, 20)

				backlashAttack.shouldIgnoreCards.push((instance) => {
					const pos = getCardPos(game, instance)
					if (!pos || !pos.row || !pos.row.effectCard) return false

					if (
						['gold_armor', 'iron_armor', 'diamond_armor', 'netherite_armor'].includes(
							pos.row.effectCard.cardId
						)
					) {
						// It's an armor card, ignore it
						return true
					}

					return false
				})

				attack.addNewAttack(backlashAttack)
			}

			return attack
		})

		opponentPlayer.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[triggeredKey]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		const triggeredKey = this.getInstanceKey(instance, 'triggered')
		opponentPlayer.hooks.afterAttack.remove(instance)
		opponentPlayer.hooks.onTurnEnd.remove(instance)
		delete player.custom[triggeredKey]
	}
}

export default ThornsEffectCard
