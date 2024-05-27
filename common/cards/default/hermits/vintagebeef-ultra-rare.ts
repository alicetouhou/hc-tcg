import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
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
				power: 'If you have AFK Docm77, Bdubs AND Etho on the game board, attack damage doubles.',
			},
		})
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onAttack.add(instance, (attack) => {
			if (attack.getCreator() !== instance || attack.type !== 'secondary') return

			const hasBdubs = player.board.rows.some((row) =>
				row.hermitCard?.id?.startsWith('bdoubleo100')
			)
			const hasDoc = player.board.rows.some((row) => row.hermitCard?.id?.startsWith('docm77'))
			const hasEtho = player.board.rows.some((row) => row.hermitCard?.id?.startsWith('ethoslab'))

			if (hasBdubs && hasDoc && hasEtho) attack.addDamage(this.id, attack.getDamage())
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		// Remove hooks
		player.hooks.onAttack.remove(instance)
	}
}

export default VintageBeefUltraRareHermitCard
