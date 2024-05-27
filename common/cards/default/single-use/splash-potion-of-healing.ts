import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import HermitCard from '../../base/hermit-card'
import SingleUseCard from '../../base/single-use-card'
import {HERMIT_CARDS} from '../../index'

class SplashPotionOfHealingSingleUseCard extends SingleUseCard {
	constructor() {
		super({
			id: 'splash_potion_of_healing',
			numericId: 89,
			name: 'Splash Potion of Healing',
			rarity: 'common',
			description: 'Heal all of your Hermits 20hp.',
		})
	}

	override canApply() {
		return true
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.onApply.add(instance, () => {
			for (let row of player.board.rows) {
				if (!row.hermitCard) continue
				if (row.hermitCard instanceof HermitCard) {
					const maxHealth = Math.max(row.health, row.hermitCard.health)
					row.health = Math.min(row.health + 20, maxHealth)
				}
			}
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos
		player.hooks.onApply.remove(instance)
	}
}

export default SplashPotionOfHealingSingleUseCard
