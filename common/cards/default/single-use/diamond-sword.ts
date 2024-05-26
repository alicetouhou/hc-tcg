import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow, getActiveRowPos} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class DiamondSwordSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'diamond_sword',
			numericId: 14,
			name: 'Diamond Sword',
			rarity: 'rare',
			description: "Do 40hp damage to your opponent's active Hermit.",
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
				creator: instance,
				attacker: playerActiveRow?.hermitCard.cardInstance,
				target: opponentActiveRow?.hermitCard.cardInstance,
				type: 'effect',
				log: (values) => `${values.header} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 40)

			return swordAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
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

export default DiamondSwordSingleUseCard
