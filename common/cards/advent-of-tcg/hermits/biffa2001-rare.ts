import {GameModel, GameValue} from '../../../models/game-model'
import {
	CardComponent,
	ObserverComponent,
	PlayerComponent,
	StatusEffectComponent,
} from '../../../components'
import Card from '../../base/card'
import {hermit} from '../../base/defaults'
import {Hermit} from '../../base/types'
import {PlayerEntity} from '../../../entities'
import query from '../../../components/query'
import MuseumCollectionEffect from '../../../status-effects/museum-collection'
import {executeExtraAttacks} from '../../../utils/attacks'

class Biffa2001Rare extends Card {
	props: Hermit = {
		...hermit,
		id: 'biffa2001_rare',
		numericId: 206,
		name: 'Biffa',
		expansion: 'advent_of_tcg',
		palette: 'advent_of_tcg',
		background: 'advent_of_tcg',
		rarity: 'rare',
		tokens: 3,
		type: 'miner',
		health: 290,
		primary: {
			name: 'O.H.O',
			cost: ['miner'],
			damage: 40,
			power: null,
		},
		secondary: {
			name: "Biffa's Museum",
			cost: ['miner', 'any'],
			damage: 70,
			power: 'For each card you played or used this turn, this attack does 20 more damage.',
		},
	}

	cardsPlayed = new GameValue<Record<PlayerEntity, number | undefined>>(() => {
		return {}
	})

	override onCreate(game: GameModel, component: CardComponent) {
		if (Object.hasOwn(this.cardsPlayed.values, game.id)) return
		this.cardsPlayed.set(game, {})

		const newObserver = game.components.new(ObserverComponent, component.entity)

		game.components.filter(PlayerComponent).forEach((player) => {
			let museumEffect: StatusEffectComponent | null = null
			let oldHandSize = player.getHand().length

			newObserver.subscribe(player.hooks.onTurnStart, () => {
				this.cardsPlayed.get(game)[player.entity] = 0
				oldHandSize = player.getHand().length
				// Only display status effect if Biffa is on the board
				if (
					game.components.exists(
						CardComponent,
						query.card.is(Biffa2001Rare),
						query.card.slot(query.slot.hermit)
					)
				) {
					museumEffect = game.components.new(
						StatusEffectComponent,
						MuseumCollectionEffect,
						component.entity
					)
					museumEffect.counter = 0
					museumEffect.apply(player.entity)
				}
			})

			newObserver.subscribe(player.hooks.onAttach, (cardInstance) => {
				const handSize = player.getHand().length
				if (handSize === oldHandSize) return
				oldHandSize = handSize
				if (cardInstance.slot.type === 'single_use') return
				const record = this.cardsPlayed.get(game)
				record[player.entity] = (record[player.entity] || 0) + 1
				if (museumEffect === null) {
					// Create display status effect if first Biffa is placed on board
					if (!query.card.is(Biffa2001Rare)(game, cardInstance)) return
					museumEffect = game.components.new(
						StatusEffectComponent,
						MuseumCollectionEffect,
						component.entity
					)
					museumEffect.apply(player.entity)
				}
				museumEffect.counter = record[player.entity]! // This should be a positive number but ts doesn't recognize it
			})

			newObserver.subscribe(player.hooks.onApply, () => {
				oldHandSize = player.getHand().length
				const record = this.cardsPlayed.get(game)
				record[player.entity] = (record[player.entity] || 0) + 1
				if (museumEffect) museumEffect.counter = record[player.entity]! // see comment above
			})

			newObserver.subscribe(player.hooks.onTurnEnd, () => {
				museumEffect?.remove()
			})
		})
	}

	override onAttach(game: GameModel, component: CardComponent, observer: ObserverComponent) {
		const {player} = component

		observer.subscribe(player.hooks.onAttack, (attack) => {
			if (!attack.isAttacker(component.entity) || attack.type !== 'secondary') return

			const counter = this.cardsPlayed.get(game)[player.entity]
			if (counter === undefined) return

			observer.subscribe(player.hooks.onApply, () => {
				const additionalAttack = game
					.newAttack({
						attacker: component.entity,
						target: attack.targetEntity,
						type: 'secondary',
						log: (values) =>
							`${values.attacker} dealt an extra ${values.damage} damage to ${values.target} for using a single use card with $v${this.props.secondary.name}$`,
					})
					.addDamage(component.entity, 20)
				additionalAttack.shouldIgnoreCards.push(query.card.entity(component.entity))

				executeExtraAttacks(game, [additionalAttack])
			})

			observer.oneShot(player.hooks.onTurnEnd, () => {
				observer.unsubscribe(player.hooks.onApply)
			})

			attack.addDamage(component.entity, 20 * counter)
		})
	}
}

export default Biffa2001Rare
