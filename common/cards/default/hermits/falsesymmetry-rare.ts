import {HERMIT_CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class FalseSymmetryRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'falsesymmetry_rare',
			numericId: 23,
			name: 'False',
			rarity: 'rare',
			hermitType: 'builder',
			health: 250,
			primary: {
				name: 'High Noon',
				cost: ['builder'],
				damage: 60,
				power: null,
			},
			secondary: {
				name: 'Supremacy',
				cost: ['builder', 'any'],
				damage: 70,
				power: 'Flip a coin.\nIf heads, heal this Hermit 40hp.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attacker = attack.getAttacker()
			if (attack.getCreator() !== instance || attack.type !== 'secondary' || !attacker) return

			const coinFlip = flipCoin(player, attacker.row.hermitCard)

			if (coinFlip[0] === 'tails') return

			// Heal 40hp
			const maxHealth = Math.max(attacker.row.health, attacker.row.hermitCard.health)
			attacker.row.health = Math.min(attacker.row.health + 40, maxHealth)

			game.battleLog.addCustomEntry(`$p${attacker.row.hermitCard.name}$ healed $g40hp$`, player.id)
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default FalseSymmetryRareHermitCard
