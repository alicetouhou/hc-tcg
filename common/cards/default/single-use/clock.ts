import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {TurnActions} from '../../../types/game-state'
import {applyStatusEffect, getActiveRow} from '../../../utils/board'
import SingleUseCard from '../../base/single-use-card'

class ClockSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'clock',
			numericId: 6,
			name: 'Clock',
			rarity: 'ultra_rare',
			description:
				'Your opponent skips their next turn.\n\nThis card can not be returned to your hand from your discard pile.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {opponentPlayer, player} = pos

		player.hooks.onApply.add(instance, () => {
			opponentPlayer.hooks.onTurnStart.add(instance, () => {
				game.addBlockedActions(
					this.id,
					'APPLY_EFFECT',
					'REMOVE_EFFECT',
					'SINGLE_USE_ATTACK',
					'PRIMARY_ATTACK',
					'SECONDARY_ATTACK',
					'PLAY_HERMIT_CARD',
					'PLAY_ITEM_CARD',
					'PLAY_SINGLE_USE_CARD',
					'PLAY_EFFECT_CARD'
				)
				opponentPlayer.hooks.onTurnStart.remove(instance)
			})

			applyStatusEffect(game, 'used-clock', getActiveRow(player)?.hermitCard.cardInstance)
		})
	}

	override canAttach(game: GameModel, pos: CardPosModel) {
		const canAttach = super.canAttach(game, pos)

		if (game.state.statusEffects.some((effect) => effect.statusEffectId === 'used-clock')) {
			return 'INVALID'
		}

		if (canAttach !== 'YES') return canAttach

		// The other player wouldn't be able to attach anything
		if (game.state.turn.turnNumber === 1) return 'NO'
		return 'YES'
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}

	override sidebarDescriptions() {
		return [
			{
				type: 'overt',
				name: 'Turn Skip',
				description:
					"A player who's turn is skipped can only choose to change their active Hermit. They still draw a card at the end of their turn. Turns cannot be skipped consecutively.",
			},
		]
	}
}

export default ClockSingleUseCard
