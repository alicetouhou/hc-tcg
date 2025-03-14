import {CardComponent, ObserverComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack} from '../../types/priorities'
import {flipCoin} from '../../utils/coinFlips'
import {hermit} from '../defaults'
import {Hermit} from '../types'

/*
- Beef confirmed that double damage condition includes other rare mumbos.
*/
const MumboJumboRare: Hermit = {
	...hermit,
	id: 'mumbojumbo_rare',
	numericId: 81,
	name: 'Mumbo',
	expansion: 'default',
	rarity: 'rare',
	tokens: 4,
	type: 'prankster',
	health: 290,
	primary: {
		name: 'Moustache',
		cost: ['prankster'],
		damage: 60,
		power: null,
	},
	secondary: {
		name: 'Quite Simple',
		cost: ['prankster', 'prankster', 'prankster'],
		damage: 0,
		power:
			'For each Prankster Hermit on your side of the game board, flip a coin. \nDo an additional 40hp damage for every heads.',
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			game.hooks.beforeAttack,
			beforeAttack.MODIFY_DAMAGE,
			(attack) => {
				if (!attack.isAttacker(component.entity) || attack.type !== 'secondary')
					return
				const pranksterAmount = game.components.filter(
					CardComponent,
					query.card.currentPlayer,
					query.card.type('prankster'),
				).length

				const coinFlip = flipCoin(game, player, component, pranksterAmount)
				const headsAmount = coinFlip.filter((flip) => flip === 'heads').length

				attack.addDamage(component.entity, headsAmount * 40)
				if (pranksterAmount > 0) attack.multiplyDamage(component.entity, 2)
			},
		)
	},
}

export default MumboJumboRare
