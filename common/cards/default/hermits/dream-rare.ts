import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import {flipCoin} from '../../../utils/coinFlips'
import HermitCard from '../../base/hermit-card'

class DreamRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'dream_rare',
			numericId: 117,
			name: 'Dream',
			rarity: 'rare',
			hermitType: 'speedrunner',
			health: 290,
			primary: {
				name: "C'mere",
				cost: ['speedrunner', 'any'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Transition',
				cost: ['speedrunner', 'speedrunner', 'any'],
				damage: 90,
				power: 'Flip a Coin.\n\nIf heads, HP is set randomly between 10-290.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			if (attack.id !== attackId || attack.type !== 'secondary') return

			const coinFlip = flipCoin(player, this.id)

			if (coinFlip[0] === 'tails') return

			const activeRow = getActiveRow(player)

			if (!activeRow) return

			activeRow.health = (Math.floor(Math.random() * 28) + 1) * 10
		})
	}

	public override getExpansion(): string {
		return 'dream'
	}
}

export default DreamRareHermitCard
