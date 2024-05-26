import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class TNTSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'tnt',
			numericId: 100,
			name: 'TNT',
			rarity: 'common',
			description:
				"Do 60hp damage to your opponent's active Hermit. Your active Hermit also takes 20hp damage.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const playerActiveRow = getActiveRow(player)
			const opponentActiveRow = getActiveRow(opponentPlayer)

			const tntAttack = new AttackModel({
				game: game,
				creator: instance,
				attacker: playerActiveRow?.hermitCard.cardInstance,
				target: opponentActiveRow?.hermitCard.cardInstance,
				type: 'effect',
				log: (values) => `${values.header} to attack ${values.target} for ${values.damage} damage`,
			}).addDamage(this.id, 60)

			const backlashAttack = new AttackModel({
				game: game,
				creator: instance,
				attacker: playerActiveRow?.hermitCard.cardInstance,
				target: playerActiveRow?.hermitCard.cardInstance,
				type: 'effect',
				isBacklash: true,
				log: (values) => `and took ${values.damage} backlash damage`,
			}).addDamage(this.id, 20)

			tntAttack.addNewAttack(backlashAttack)

			return tntAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.getCreator() !== instance || !attack.isBacklash) return
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

export default TNTSingleUseCard
