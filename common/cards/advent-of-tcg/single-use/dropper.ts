import {GameModel} from '../../../models/game-model'
import {CardComponent, DeckSlotComponent, ObserverComponent} from '../../../components'
import Card from '../../base/card'
import {singleUse} from '../../base/defaults'
import {SingleUse} from '../../base/types'
import FletchingTable from './fletching-table'

class Dropper extends Card {
	props: SingleUse = {
		...singleUse,
		id: 'dropper',
		numericId: 222,
		name: 'Dropper',
		expansion: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 0,
		description: "Place a fletching table on the top of your opponent's deck",
		showConfirmationModal: true,
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent): void {
		const {player, opponentPlayer} = component

		observer.subscribe(player.hooks.onApply, () => {
			let slot = game.components.new(DeckSlotComponent, opponentPlayer.entity, {
				position: 'front',
			})
			game.components.new(CardComponent, FletchingTable, slot.entity)
		})
	}
}

export default Dropper
