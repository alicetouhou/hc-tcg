import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class GoldenAxeSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'golden_axe',
			numericId: 31,
			name: 'Golden Axe',
			rarity: 'rare',
			description:
				"Do 40hp damage to your opponent's active Hermit.\nAny effect card attached to your opponent's active Hermit is ignored during this turn.",
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const playerActiveRow = getActiveRow(player)
			const opponentActiveRow = getActiveRow(opponentPlayer)

			const axeAttack = new AttackModel({
				game: game,
				creator: pos.card,
				attacker: playerActiveRow?.hermitCard,
				target: opponentActiveRow?.hermitCard,
				type: 'effect',
				log: (values) => `${values.header} to attack ${values.target} for ${values.damage} damage,`,
			}).addDamage(this.id, 40)

			return axeAttack
		})

		player.hooks.beforeAttack.addBefore(instance, (attack) => {
			if (attack.getCreator() === instance) {
				applySingleUse(game)
			}

			attack.shouldIgnoreCards.push((instance) => {
				if (!pos || !pos.row || !pos.row.effectCard) return false

				// It's not the targets effect card, do not ignore it
				if (pos.slot.type !== 'effect') return false

				// Not attached to the same row as the opponent's active Hermit, do not ignore it
				if (pos.rowIndex !== opponentPlayer.board.activeRow) return false

				// Do not ignore the player's effect.
				if (pos.player === player) return false

				return true
			})
		})

		player.hooks.onTurnEnd.add(instance, () => {
			player.hooks.getAttacks.remove(instance)
			player.hooks.beforeAttack.remove(instance)
			player.hooks.afterAttack.remove(instance)
		})
	}

	override canAttack() {
		return true
	}
}

export default GoldenAxeSingleUseCard
