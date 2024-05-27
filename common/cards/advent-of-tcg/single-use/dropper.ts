import {CARDS} from '../..'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'

class DropperSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'dropper',
			numericId: 222,
			name: 'Dropper',
			rarity: 'rare',
			description: "Shuffle 2 fletching tables into your opponent's deck",
		})
	}

	public override canApply(): boolean {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			for (let i = 0; i < 2; i++) {
				opponentPlayer.pile.splice(
					Math.round(Math.random() * opponentPlayer.pile.length),
					0,
					CARDS['fletching_table']
				)
			}
		})
	}

	public override onDetach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player} = pos

		player.hooks.onApply.remove(instance)
	}

	override getExpansion() {
		return 'advent_of_tcg'
	}
}

export default DropperSingleUseCard
