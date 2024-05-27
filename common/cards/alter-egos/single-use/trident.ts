import {CARDS} from '../..'
import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {applySingleUse, getActiveRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import {discardSingleUse} from '../../../utils/movement'
import SingleUseCard from '../../base/single-use-card'

class TridentSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'trident',
			numericId: 150,
			name: 'Trident',
			rarity: 'rare',
			description:
				"Do 30hp damage to your opponent's active Hermit.\nFlip a coin.\nIf heads, this card is returned to your hand.",
			log: null,
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.getAttacks.add(instance, () => {
			const playerActiveRow = getActiveRow(player)
			const opponentActiveRow = getActiveRow(opponentPlayer)

			const tridentAttack = new AttackModel({
				game: game,
				creator: pos.card,
				attacker: playerActiveRow?.hermitCard,
				target: opponentActiveRow?.hermitCard,
				type: 'effect',
				log: (values) =>
					`${values.header} to attack ${values.target} for ${values.damage} damage, then ${values.coinFlip}`,
			}).addDamage(this.id, 30)

			return tridentAttack
		})

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.getCreator() !== instance) return

			player.custom[this.getInstanceKey(instance)] = flipCoin(player, this)[0]

			applySingleUse(game)
		})

		player.hooks.onApply.add(instance, () => {
			// Return to hand
			if (player.custom[this.getInstanceKey(instance)] === 'heads') {
				// Reset single use card used, won't return to the hand otherwise
				player.board.singleUseCardUsed = false
				discardSingleUse(game, player)
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.getAttacks.remove(instance)
		player.hooks.onApply.remove(instance)
		player.hooks.onAttack.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override canAttack() {
		return true
	}
}

export default TridentSingleUseCard
