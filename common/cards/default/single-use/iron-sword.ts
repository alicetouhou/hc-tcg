import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class IronSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'iron_sword',
			numericId: 46,
			name: 'Iron Sword',
			rarity: 'common',
			description: "Do 20hp damage to your opponent's active Hermit.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const playerActiveRow = getActiveRow(player)
			const opponentActiveRow = getActiveRow(opponentPlayer)

			const swordAttack = new AttackModel({
				game: game,
				creator: pos.card,
				attacker: playerActiveRow?.hermitCard,
				target: opponentActiveRow?.hermitCard,
				type: 'effect',
				log: (values) => `${values.header} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 20)

			return swordAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance, 'attack')
			if (attack.getCreator() !== instance) return

			// We've executed our attack, apply effect
			applySingleUse(game)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.getAttacks.remove(instance)
		player.hooks.onAttack.remove(instance)
	}

	override canAttack() {
		return true
	}
}

export default IronSwordSingleUseCard
