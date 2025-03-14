import {CardComponent, ObserverComponent, RowComponent} from '../../components'
import query from '../../components/query'
import {GameModel} from '../../models/game-model'
import {beforeAttack, onTurnEnd} from '../../types/priorities'
import {hermit} from '../defaults'
import {Hermit} from '../types'

const PotatoBoyRare: Hermit = {
	...hermit,
	id: 'potatoboy_rare',
	numericId: 135,
	name: 'Potato Boy',
	expansion: 'alter_egos',
	palette: 'alter_egos',
	background: 'alter_egos',
	rarity: 'rare',
	tokens: 2,
	type: 'farm',
	health: 270,
	primary: {
		name: 'Peace & Love',
		cost: [],
		damage: 0,
		power:
			'At the end of each turn, if your active Hermit is adjacent to this Hermit, heal them 20hp.',
		passive: true,
	},
	secondary: {
		name: 'Volcarbo',
		cost: ['farm', 'farm', 'any'],
		damage: 90,
		power: null,
	},
	onAttach(
		game: GameModel,
		component: CardComponent,
		observer: ObserverComponent,
	) {
		const {player} = component

		observer.subscribeWithPriority(
			player.hooks.onTurnEnd,
			onTurnEnd.POTATO_BOY,
			() => {
				game.components
					.filter(
						RowComponent,
						query.row.player(player.entity),
						query.row.adjacent(query.row.active),
						query.row.hasHermit,
					)
					.forEach((row) => {
						row.heal(40)
						let hermit = row.getHermit()
						game.battleLog.addEntry(
							player.entity,
							`$p${hermit?.props.name} (${row.index + 1})$ was healed $g40hp$ by $p${
								component.props.name
							}$`,
						)
					})
			},
		)
	},
}

export default PotatoBoyRare
