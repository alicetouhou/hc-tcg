import StatusEffect from './status-effect'
import {GameModel} from '../models/game-model'
import {CardPosModel, getBasicCardPos} from '../models/card-pos-model'
import {AttackModel} from '../models/attack-model'
import {getActiveRow, removeStatusEffect} from '../utils/board'
import {StatusEffectT} from '../types/game-state'
import {executeExtraAttacks} from '../utils/attacks'

class FireStatusEffect extends StatusEffect {
	constructor() {
		super({
			id: 'fire',
			name: 'Burn',
			description:
				"Burned Hermits take an additional 20hp damage at the end of their opponent's turn, until knocked out. Can not stack with poison.",
			duration: 0,
			counter: false,
			damageEffect: true,
			visible: true,
		})
	}

	override onApply(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		const hasDamageEffect = game.state.statusEffects.some(
			(a) => a.targetInstance === pos.card?.instance && a.damageEffect === true
		)

		if (hasDamageEffect) return

		game.state.statusEffects.push(statusEffectInfo)

		opponentPlayer.hooks.onTurnEnd.add(statusEffectInfo.statusEffectInstance, () => {
			const activeRow = getActiveRow(opponentPlayer)
			const targetPos = getBasicCardPos(game, statusEffectInfo.targetInstance)

			const statusEffectAttack = new AttackModel({
				game: game,
				creator: {id: this.id, instance: statusEffectInfo.statusEffectInstance},
				attacker: activeRow?.hermitCard,
				target: targetPos?.row?.hermitCard,
				type: 'status-effect',
				log: (values) => `${values.target} took ${values.damage} damage from $bBurn$`,
			})
			statusEffectAttack.addDamage(this.id, 20)

			executeExtraAttacks(game, [statusEffectAttack], true)
		})

		player.hooks.afterDefence.add(statusEffectInfo.statusEffectInstance, (attack) => {
			const attackTarget = attack.getTarget()
			if (!attackTarget) return
			if (attackTarget.row.hermitCard.instance !== statusEffectInfo.targetInstance) return
			if (attackTarget.row.health > 0) return
			removeStatusEffect(game, pos, statusEffectInfo.statusEffectInstance)
		})
	}

	override onRemoval(game: GameModel, statusEffectInfo: StatusEffectT, pos: CardPosModel) {
		const {player, opponentPlayer} = pos
		opponentPlayer.hooks.onTurnEnd.remove(statusEffectInfo.statusEffectInstance)
		player.hooks.afterDefence.remove(statusEffectInfo.statusEffectInstance)
	}
}

export default FireStatusEffect
