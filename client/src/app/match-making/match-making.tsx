import React, {ReactNode, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {setCode, leaveMatchmaking, startPrivateGame} from 'logic/matchmaking/matchmaking-actions'
import {
	getStatus,
	getCode,
	getInvalidCode,
	getCustomSettings,
} from 'logic/matchmaking/matchmaking-selectors'
import css from './match-making.module.scss'
import deckCss from '../deck/deck.module.scss'
import TcgLogo from 'components/tcg-logo'
import Button from 'components/button'
import Spinner from 'components/spinner'
import ErrorBanner from 'components/error-banner'
import {PlayerDeckT} from 'common/types/deck'
import {validateDeck} from 'common/utils/validation'
import {CARDS} from 'common/cards'
import {CardT} from 'common/types/game-state'
import Tooltip from 'components/tooltip'
import {getPlayerDeck} from 'logic/session/session-selectors'
import {getSavedDecks} from 'logic/saved-decks/saved-decks'
import classNames from 'classnames'
import errorIcon from 'components/svgs/errorIcon'
import {EXPANSIONS} from 'common/config'
import {ExpansionMap} from 'app/deck/deck-edit'
import {ToastT} from 'common/types/app'

function MatchMaking() {
	const dispatch = useDispatch()
	const dispatchToast = (toast: ToastT) => dispatch({type: 'SET_TOAST', payload: toast})
	const status = useSelector(getStatus)
	const code = useSelector(getCode)
	const customSettings = useSelector(getCustomSettings)
	const invalidCode = useSelector(getInvalidCode)
	const playerDeck = useSelector(getPlayerDeck)
	const [savedDecks, setSavedDecks] = useState<Array<string>>(getSavedDecks)

	const [loadedDeck, setLoadedDeck] = useState<PlayerDeckT>({...playerDeck})

	const invalidDeckToast: ToastT = {
		open: true,
		title: 'Cannot join queue!',
		description: `${playerDeck.name} is not a valid deck.`,
		image: `images/types/type-${playerDeck.icon}.png`,
	}

	const updateDeck = (deck: PlayerDeckT) => {
		dispatch({
			type: 'UPDATE_DECK',
			payload: deck,
		})
	}

	console.log(customSettings)

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
			customSettings.disabled ? customSettings.disabled : EXPANSIONS.disabled
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

	const handleCancel = () => {
		dispatch(leaveMatchmaking())
	}

	const handleCodeSubmit = (ev: React.SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const code = ev.currentTarget.gameCode.value.trim()
		dispatch(setCode(code))
	}

	const handleCodeClick = () => {
		if (!code) return
		navigator.clipboard.writeText(code)
	}

	const handleConfirm = (code: string | null) => {
		if (
			validateDeck(
				playerDeck.cards.map((card) => card.cardId),
				customSettings.disabled ? customSettings.disabled : EXPANSIONS.disabled
			)
		) {
			return dispatchToast(invalidDeckToast)
		}
		dispatch(startPrivateGame(code))
	}

	const Status = () => {
		switch (status) {
			default:
			case 'random_waiting':
				return (
					<>
						<Spinner />
						<p>Waiting for opponent</p>
						<Button variant="stone" onClick={handleCancel}>
							Cancel
						</Button>
					</>
				)
			case 'loading':
				return (
					<>
						<Spinner />
						<p>Loading</p>
					</>
				)
			case 'waiting_for_player':
				return (
					<>
						<Spinner />
						<p>Waiting for second player</p>
					</>
				)
			case 'confirmation_waiting':
				return (
					<>
						<Spinner />
						<p>Confirming</p>
					</>
				)
			case 'starting':
				return (
					<>
						<Spinner />
						<p>Starting Game</p>
					</>
				)
			case 'private_waiting':
				return (
					<>
						<p>Waiting for opponent</p>
						<div className={css.code} onClick={handleCodeClick}>
							{code}
						</div>
						<div className={css.options}>
							<Button variant="stone" onClick={handleCancel}>
								Cancel
							</Button>
						</div>
					</>
				)
			case 'player_confirmation':
				return (
					<div className={css.confirmationGrid}>
						<div className={css.confirmationGridSection}>
							<h4>Custom game rules</h4>
							<div>
								Enabled expansions:{' '}
								{customSettings.disabled &&
									Object.keys(EXPANSIONS.expansions)
										.filter((e) => !customSettings.disabled.includes(e))
										.map((expansion) => (EXPANSIONS.expansions as ExpansionMap)[expansion])
										.join(', ')}
							</div>
						</div>
						<div className={css.confirmationGridSection}>{deckList}</div>
						<Button
							variant="default"
							onClick={() => handleCancel()}
							className={css.confirmationButton}
						>
							Cancel
						</Button>
						<Button
							variant="default"
							onClick={() => handleConfirm(code)}
							className={css.confirmationButton}
						>
							Confirm
						</Button>
					</div>
				)
			case 'private_code_needed':
				return (
					<>
						<form className={css.codeInput} onSubmit={handleCodeSubmit}>
							<label htmlFor="gameCode">Enter game code:</label>
							<input
								className={invalidCode ? css.invalidCode : ''}
								name="gameCode"
								id="gameCode"
								autoFocus
							/>
							{invalidCode && <ErrorBanner>Invalid Code</ErrorBanner>}
							<div className={css.options}>
								<Button type="button" variant="stone" onClick={handleCancel}>
									Cancel
								</Button>
								<Button type="submit" variant="stone">
									Join
								</Button>
							</div>
						</form>
					</>
				)
		}
	}

	return (
		<div className={css.body}>
			<TcgLogo />
			<div className={css.content}>
				<Status />
			</div>
		</div>
	)
}

export default MatchMaking
