import {CardPosModel} from '../../../models/card-pos-model'
import {GameModel} from '../../../models/game-model'
import {HermitAttackType} from '../../../types/attack'
import Card from '../../base/card'
import HermitCard from '../../base/hermit-card'

class HotguyRareHermitCard extends HermitCard {
	constructor() {
		super({
			id: 'hotguy_rare',
			numericId: 131,
			name: 'Hotguy',
			rarity: 'rare',
			hermitType: 'explorer',
			health: 280,
			primary: {
				name: 'Velocité',
				cost: ['explorer'],
				damage: 50,
				power: null,
			},
			secondary: {
				name: 'Hawkeye',
				cost: ['explorer', 'explorer'],
				damage: 80,
				power: 'When used with a bow effect card, bow damage doubles.',
			},
		})
	}

	override getAttacks(
		game: GameModel,
		instance: string,
		pos: CardPosModel,
		hermitAttackType: HermitAttackType
	) {
		const attack = super.getAttacks(game, instance, pos, hermitAttackType)
		// Used for the Bow, we need to know the attack type
		if (attack && attack.type === 'secondary') {
			pos.player.custom[this.getInstanceKey(instance)] = true
		}

		return attack
	}

	override onAttach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.add(instance, (attack) => {
			if ((attack.getHistory('creator')[0].value as Card).id === 'bow') {
				attack.addDamage(this.id, attack.getDamage())
			}
		})

		player.hooks.onTurnEnd.add(instance, () => {
			delete player.custom[this.getInstanceKey(instance)]
		})
	}

	override onDetach(game: GameModel, instance: string, pos: CardPosModel) {
		const {player} = pos

		player.hooks.beforeAttack.remove(instance)
		player.hooks.onTurnEnd.remove(instance)
		delete player.custom[this.getInstanceKey(instance)]
	}

	override getExpansion() {
		return 'alter_egos'
	}

	override getPalette() {
		return 'alter_egos'
	}

	override getBackground() {
		return 'alter_egos_background'
	}
}

export default HotguyRareHermitCard
