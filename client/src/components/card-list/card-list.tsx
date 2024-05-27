import cn from 'classnames'
import {CARDS} from 'common/cards'
import CardComponent from 'components/card'
import css from './card-list.module.scss'
import {CSSTransition, TransitionGroup} from 'react-transition-group'
import Card from 'common/cards/base/card'
import {equalCard} from 'common/utils/cards'

type CardListProps = {
	cards: Array<Card>
	disabled?: Array<string>
	selected?: Array<Card | null>
	picked?: Array<Card>
	onClick?: (card: Card) => void
	wrap?: boolean
	tooltipAboveModal?: boolean
}

const CardList = (props: CardListProps) => {
	const {wrap, onClick, cards, disabled, selected, picked} = props

	const cardsOutput = cards.map((card) => {
		const info = CARDS[card.id] as Card
		if (!info) return null
		const isSelected = selected
			? selected.some((selectedCard) => equalCard(card, selectedCard))
			: false
		const isPicked = !!picked?.find((pickedCard) => equalCard(card, pickedCard))
		const isDisabled = !!disabled?.find((id) => card.id === id)

		return (
			<CSSTransition
				timeout={250}
				key={card.instance}
				unmountOnExit={true}
				classNames={{
					enter: css.enter,
					enterActive: css.enterActive,
					enterDone: css.enterDone,
					exit: css.exit,
					exitActive: css.exitActive,
				}}
			>
				<CardComponent
					key={card.instance}
					className={cn(css.card, {
						[css.clickable]: !!onClick && !isDisabled,
					})}
					onClick={onClick && !isDisabled ? () => onClick(card) : undefined}
					card={info}
					disabled={isDisabled}
					selected={isSelected}
					picked={!!isPicked}
					tooltipAboveModal={props.tooltipAboveModal}
				/>
			</CSSTransition>
		)
	})

	return (
		<TransitionGroup className={cn(css.cardList, {[css.wrap]: wrap})}>
			{cardsOutput}
		</TransitionGroup>
	)
}

export default CardList
