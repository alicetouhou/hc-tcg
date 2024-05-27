import classnames from 'classnames'
import {CARDS} from 'common/cards'
import {RowState} from 'common/types/game-state'
import css from './board.module.scss'
import HermitCard from 'common/cards/base/hermit-card'
import EffectCard from 'common/cards/base/effect-card'
import SingleUseCard from 'common/cards/base/single-use-card'
import ItemCard from 'common/cards/base/item-card'
import HealthCard from 'common/cards/base/health-card'
import {StatusEffectT} from 'common/types/game-state'
import StatusEffect from 'components/status-effects/status-effect'
import {STATUS_EFFECT_CLASSES} from 'common/status-effects'
import {SlotTypeT} from 'common/types/cards'
import Card from 'common/cards/base/card'
import CardComponent from 'components/card/card'

export type SlotProps = {
	type: SlotTypeT
	onClick?: () => void
	card: Card | null
	rowState?: RowState
	active?: boolean
	cssId?: string
	statusEffects: Array<StatusEffectT>
}
const Slot = ({type, onClick, card, rowState, active, cssId, statusEffects}: SlotProps) => {
	if (type === 'health' && rowState?.health) {
		card = new HealthCard({
			id: 'health',
			name: 'Health Card',
			rarity: 'common',
			health: rowState.health,
		})
	}

	const renderStatusEffects = (cleanedStatusEffects: StatusEffectT[]) => {
		return (
			<div className={css.statusEffectContainer}>
				{cleanedStatusEffects.map((a) => {
					const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
					if (!statusEffect || !statusEffect.visible) return null
					if (statusEffect.damageEffect == true) return null
					return <StatusEffect statusEffect={statusEffect} duration={a.duration} />
				})}
			</div>
		)
	}
	const renderDamageStatusEffects = (cleanedStatusEffects: StatusEffectT[] | null) => {
		return (
			<div className={css.damageStatusEffectContainer}>
				{cleanedStatusEffects
					? cleanedStatusEffects.map((a) => {
							const statusEffect = STATUS_EFFECT_CLASSES[a.statusEffectId]
							if (!statusEffect || !statusEffect.visible) return null
							if (statusEffect.damageEffect == false) return null
							return <StatusEffect statusEffect={statusEffect} />
					  })
					: null}
			</div>
		)
	}

	const hermitStatusEffects = Array.from(
		new Set(
			statusEffects
				.filter((a) => rowState?.hermitCard && a.targetInstance == rowState.hermitCard.instance)
				.map((a) => a) || []
		)
	)
	const effectStatusEffects = Array.from(
		new Set(
			statusEffects.filter(
				(a) => rowState?.effectCard && a.targetInstance == rowState.effectCard.instance
			) || []
		)
	)
	const frameImg = type === 'hermit' ? '/images/game/frame_glow.png' : '/images/game/frame.png'

	return (
		<div
			onClick={onClick}
			id={css[cssId || 'slot']}
			className={classnames(css.slot, {
				[css.available]: !!onClick,
				[css[type]]: true,
				[css.empty]: !card,
				[css.afk]: !active && type !== 'single_use',
			})}
		>
			{card ? (
				<div className={css.cardWrapper}>
					<CardComponent card={card} />
					{type === 'health'
						? renderStatusEffects(hermitStatusEffects)
						: type === 'effect'
						? renderStatusEffects(effectStatusEffects)
						: null}
					{type === 'health'
						? renderDamageStatusEffects(hermitStatusEffects)
						: type === 'effect'
						? renderDamageStatusEffects(effectStatusEffects)
						: renderDamageStatusEffects(null)}
				</div>
			) : type === 'health' ? null : (
				<img draggable="false" className={css.frame} src={frameImg} />
			)}
		</div>
	)
}

export default Slot
