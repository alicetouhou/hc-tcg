import {AttackModel} from '../../../models/attack-model'
import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {getActiveRow} from '../../../utils/board'
import HermitCard from '../../base/hermit-card'
class VintageBeefUltraRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'vintagebeef_ultra_rare',
			numericId: 104,
			name: 'Beef',
			rarity: 'ultra_rare',
			hermitType: 'explorer',
			health: 280,
			primary: {
				name: 'Back in Action',
				cost: ['any'],
				damage: 40,
				power: null,
			},
			secondary: {
				name: 'N.H.O',
				cost: ['explorer', 'explorer', 'explorer'],
				damage: 100,
				power:
					"If you have AFK Docm77, Bdubs AND Etho on the game board, requires no items and deals 999hp damage to all of your opponent's Hermits.",
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player, opponentPlayer} = pos

		player.hooks.availableEnergy.add(instance, (availableEnergy) => {
			const playerActiveRow = getActiveRow(player)
			if (!playerActiveRow) return availableEnergy
			if (playerActiveRow.hermitCard.cardInstance !== instance) return availableEnergy

			const hasBdubs = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('bdoubleo100')
			)
			const hasDoc = player.board.rows.some((row) => row.hermitCard?.cardId?.startsWith('docm77'))
			const hasEtho = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('ethoslab')
			)

			if (!hasBdubs || !hasDoc || !hasEtho) return availableEnergy

			if (!availableEnergy.includes('explorer')) {
				game.addBlockedActions(this.id, 'PRIMARY_ATTACK')
			}

			// Turn all the energy into any energy
			return ['any', 'any', 'any']
		})

		player.hooks.beforeAttack.add(instance, (attack) => {
			const attackId = this.getInstanceKey(instance)
			const attacker = attack.getAttacker()
			if (!attacker) return

			if (attack.id !== attackId || attack.type !== 'secondary') return

			const hasBdubs = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('bdoubleo100')
			)
			const hasDoc = player.board.rows.some((row) => row.hermitCard?.cardId?.startsWith('docm77'))
			const hasEtho = player.board.rows.some((row) =>
				row.hermitCard?.cardId?.startsWith('ethoslab')
			)

			if (!hasBdubs || !hasDoc || !hasEtho) return

			attack.multiplyDamage(this.id, 0)
			attack.lockDamage(this.id)

			opponentPlayer.board.rows.forEach((row, i) => {
				if (!row.hermitCard) return
				const newAttack = new AttackModel({
					id: this.getInstanceKey(instance, 'selfAttack'),
					attacker,
					target: {
						player: opponentPlayer,
						rowIndex: i,
						row: row,
					},
					type: 'secondary',
				})
				newAttack.addDamage(this.id, 999)
				newAttack.lockDamage(this.id)
				attack.addNewAttack(newAttack)
			})
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default VintageBeefUltraRareHermitCard
