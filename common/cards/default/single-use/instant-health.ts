import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../..'
import {GameModel} from '../../../models/game-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {applySingleUse, getNonEmptyRows} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'

class InstantHealthSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'instant_health',
			numericId: 42,
			name: 'Instant Health',
			rarity: 'common',
			description: 'Heal one of your Hermits 30hp.',
			log: (values) => `${values.header} on $p${values.pick.name}$ and healed $g30hp$`,
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const result = super.canAttach(game, pos)
		const {player} = pos

		// Can't attach it there are no real hermits
		const playerHasHermit = getNonEmptyRows(player).some(
			(rowPos) => HERMIT_CARDS[rowPos.row.hermitCard.id] !== undefined
		)
		if (!playerHasHermit) result.push('UNMET_CONDITION')

		return result
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		game.addPickRequest({
			playerId: player.id,
			id: this.id,
			message: 'Pick an active or AFK Hermit',
			onResult(pickResult) {
				if (pickResult.playerId !== player.id) return 'FAILURE_INVALID_PLAYER'

				const rowIndex = pickResult.rowIndex
				if (rowIndex === undefined) return 'FAILURE_INVALID_SLOT'
				const row = player.board.rows[rowIndex]
				if (!row || !row.health) return 'FAILURE_INVALID_SLOT'

				if (pickResult.slot.type !== 'hermit') return 'FAILURE_INVALID_SLOT'
				if (!pickResult.card) return 'FAILURE_INVALID_SLOT'

				// Apply
				applySingleUse(game, pickResult)

				if (pickResult.card instanceof HermitCard) {
					const maxHealth = Math.max(row.health, pickResult.card.health)
					row.health = Math.min(row.health + 100, maxHealth)
				}

				return 'SUCCESS'
			},
		})
	}
}

export default InstantHealthSingleUseCard
