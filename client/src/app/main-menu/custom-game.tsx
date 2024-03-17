import css from './main-menu.module.scss'
import deckCss from '../deck/deck.module.scss'
import MenuLayout from 'components/menu-layout'
import {useDispatch, useSelector} from 'react-redux'
import {createPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import Button from 'components/button'
import Checkbox from 'components/checkbox'
import {EXPANSIONS} from 'common/config'
import {ExpansionMap} from 'app/deck/deck-edit'
import {ReactNode, useState} from 'react'
import {getSavedDecks} from 'logic/saved-decks/saved-decks'
import {PlayerDeckT} from 'common/types/deck'
import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {CardT} from 'common/types/game-state'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {validateDeck} from 'common/utils/validation'
import Tooltip from 'components/tooltip/tooltip'
import errorIcon from 'components/svgs/errorIcon'
import {ToastT} from 'common/types/app'

type Props = {
	setMenuSection: (section: string) => void
}

function CustomGame({setMenuSection}: Props) {
	const dispatch = useDispatch()
	const dispatchToast = (toast: ToastT) => dispatch({type: 'SET_TOAST', payload: toast})
	const [savedDecks, setSavedDecks] = useState<Array<string>>(getSavedDecks)
	const playerDeck = useSelector(getPlayerDeck)
	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({...playerDeck})
	const [customDisabled, setCustomDisabled] = useState<Array<string>>(EXPANSIONS.disabled)
	const [customSettings, setCustomSettings] = useState(false)

	const invalidDeckToast: ToastT = {
		open: true,
		title: 'Cannot join queue!',
		description: `${playerDeck.name} is not a valid deck.`,
		image: `images/types/type-${playerDeck.icon}.png`,
	}

	const handleCreatePrivateGame = () => {
		if (
			validateDeck(
				playerDeck.cards.map((card) => card.cardId),
				customDisabled
			)
		) {
			return dispatchToast(invalidDeckToast)
		}
		dispatch(createPrivateGame({customSettings: {disabled: customDisabled}}))
	}

	const updateDeck = (deck: PlayerDeckT) => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: deck,
		})
	}

	const sortedDecks = savedDecks
		.map((d: any) => {
			const deck: PlayerDeckT = JSON.parse(d)
			return deck
		})
		.sort((a, b) => a.name.localeCompare(b.name))
	const deckList: ReactNode = sortedDecks.map((deck: PlayerDeckT, i: number) => {
		const deckCards = deck.cards?.filter((card: CardT) => CARDS[card.cardId])
		const validation = validateDeck(
			deckCards.map((card) => card.cardId),
			customDisabled
		)
		return (
			<Tooltip
				tooltip={validation ? validation : 'This deck is valid under the current rules.'}
				key={i}
			>
				<li
					className={classNames(
						deckCss.myDecksItem,
						loadedDeck.name === deck.name && deckCss.selectedDeck
					)}
					key={i}
					onClick={() => {
						setLoadedDeck({
							...deck,
							cards: deckCards,
						})
						updateDeck(deck)
					}}
				>
					<div className={deckCss.deckImage}>
						<img src={'../images/types/type-' + deck.icon + '.png'} alt={'deck-icon'} />
					</div>
					<div>{validation ? errorIcon() : ''}</div>
					<div>{deck.name}</div>
				</li>
			</Tooltip>
		)
	})

	function onCheck(expansionName: string) {
		const newDisabled = [...customDisabled.filter((e) => e !== expansionName)]
		setCustomSettings(true)
		setCustomDisabled(newDisabled)
	}

	function onUncheck(expansionName: string) {
		const newDisabled = [...customDisabled, expansionName]
		setCustomSettings(true)
		setCustomDisabled(newDisabled)
	}

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Create Custom Game"
			returnText="Main Menu"
			className={css.customGameMenu}
		>
			<div>
				<h2>Enable Expansions</h2>
				<div className={css.stats}>
					{Object.keys(EXPANSIONS.expansions).map((expansion, key) => {
						return (
							<div className={css.stat} key={key}>
								<Checkbox
									defaultChecked={!EXPANSIONS.disabled.includes(expansion)}
									onCheck={() => onCheck(expansion)}
									onUncheck={() => onUncheck(expansion)}
								/>
								<span>Enable {(EXPANSIONS.expansions as ExpansionMap)[expansion]}</span>
							</div>
						)
					})}
				</div>
				<Button variant="default" id={css.privateCreate} onClick={handleCreatePrivateGame}>
					Create Custom Game
				</Button>
			</div>
			<div>
				<h2>Confirm Deck Selection</h2>
				<div>Selected deck: {loadedDeck.name}</div>
				<div className={css.stats}>{deckList}</div>
			</div>
		</MenuLayout>
	)
}

export default CustomGame
