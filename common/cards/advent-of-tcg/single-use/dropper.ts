import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import SingleUseCard from '../../base/single-use-card'

class DropperSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'dropper',
			numericId: 222,
			name: 'Dropper',
			rarity: 'common',
			description: "Place 1 fletching table at the top of your opponent's deck.",
		})
	}

	public override canApply(): boolean {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel): void {
		const {player, opponentPlayer} = pos

		player.hooks.onApply.add(instance, () => {
			const cardInfo = {
				cardId: 'fletching_table',
				cardInstance: Math.random().toString(),
			}
			opponentPlayer.pile.unshift(cardInfo)
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
