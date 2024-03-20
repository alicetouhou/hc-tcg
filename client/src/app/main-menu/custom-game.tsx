import css from './main-menu.module.scss'
import deckCss from '../deck/deck.module.scss'
import MenuLayout from 'components/menu-layout'
import {useDispatch, useSelector} from 'react-redux'
import {createPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import Button from 'components/button'
import Checkbox from 'components/checkbox'
import {CONFIG, EXPANSIONS} from 'common/config'
import {ExpansionMap} from 'app/deck/deck-edit'
import {ReactNode, useState} from 'react'
import {getSavedDecks} from 'logic/saved-decks/saved-decks'
import {PlayerDeckT} from 'common/types/deck'
import classNames from 'classnames'
import {CARDS} from 'common/cards'
import {CardT, CustomSettingsT} from 'common/types/game-state'
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
	const [customSettings, updateCustomSettings] = useState<CustomSettingsT>({
		disabledExpansions: EXPANSIONS.disabled,
		useLrf: false,
		creativeMode: false,
		maxDuplicates: CONFIG.limits.maxDuplicates,
		maxDeckCost: CONFIG.limits.maxDeckCost,
		maxCards: CONFIG.limits.maxCards,
		minCards: CONFIG.limits.minCards,
	})

	function setCustomSettings(dict: Record<string, any>) {
		updateCustomSettings({...customSettings, ...dict})
	}

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
				customSettings
			)
		) {
			return dispatchToast(invalidDeckToast)
		}
		dispatch(createPrivateGame(customSettings))
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
			customSettings
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

	function onExpansionCheck(expansionName: string) {
		if (!customSettings.disabledExpansions) customSettings.disabledExpansions = []
		const newDisabled = [...customSettings.disabledExpansions.filter((e) => e !== expansionName)]
		setCustomSettings({disabledExpansions: newDisabled})
	}

	function onExpansionUncheck(expansionName: string) {
		if (!customSettings.disabledExpansions) customSettings.disabledExpansions = []
		const newDisabled = [...customSettings.disabledExpansions, expansionName]
		setCustomSettings({disabledExpansions: newDisabled})
	}

	return (
		<MenuLayout
			back={() => setMenuSection('main-menu')}
			title="Create Custom Game"
			returnText="Main Menu"
			className={css.customGameMenu}
		>
			<div>
				<h2>Deck Building Settings</h2>
				<div className={css.stats}>
					<div className={css.deckBuildingSetting}>
						<div>Creative Mode</div>
						<Checkbox
							defaultChecked={false}
							onCheck={() => setCustomSettings({creativeMode: true})}
							onUncheck={() => setCustomSettings({creativeMode: false})}
						/>
					</div>
					{Object.keys(EXPANSIONS.expansions).map((expansion, key) => {
						return (
							<div className={css.stat} key={key}>
								<span>Enable {(EXPANSIONS.expansions as ExpansionMap)[expansion]}</span>
								<Checkbox
									defaultChecked={!EXPANSIONS.disabled.includes(expansion)}
									onCheck={() => onExpansionCheck(expansion)}
									onUncheck={() => onExpansionUncheck(expansion)}
								/>
							</div>
						)
					})}
					<div className={css.stat}>
						<span>Use Low Rarity Format</span>

						<Checkbox
							defaultChecked={false}
							onCheck={() => setCustomSettings({useLrf: true})}
							onUncheck={() => setCustomSettings({useLrf: false})}
						/>
					</div>
					<div className={css.stat}>
						<span>Set Max Deck Cost</span>
						<span>
							<input
								type="number"
								className={css.settingsInput}
								placeholder={'' + CONFIG.limits.maxDeckCost}
								onChange={(e) => setCustomSettings({maxDeckCost: Number(e.target.value)})}
							/>
						</span>
					</div>
					<div className={css.stat}>
						<span>Set Max Duplicates</span>
						<span>
							<input
								type="number"
								className={css.settingsInput}
								placeholder={'' + CONFIG.limits.maxDuplicates}
								onChange={(e) => setCustomSettings({maxDuplicates: Number(e.target.value)})}
							/>
						</span>
					</div>
					<div className={css.stat}>
						<span>Set Minimum Cards</span>
						<span>
							<input
								type="number"
								className={css.settingsInput}
								placeholder={'' + CONFIG.limits.minCards}
								onChange={(e) => setCustomSettings({minCards: Number(e.target.value)})}
							/>
						</span>
					</div>
					<div className={css.stat}>
						<span>Set Maximum Cards</span>
						<span>
							<input
								type="number"
								className={css.settingsInput}
								placeholder={'' + CONFIG.limits.maxCards}
								onChange={(e) => setCustomSettings({maxCards: Number(e.target.value)})}
							/>
						</span>
					</div>
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
