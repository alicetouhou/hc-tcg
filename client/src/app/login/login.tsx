import Beef from 'components/beef'
import Button from 'components/button'
import ErrorBanner from 'components/error-banner'
import {VersionLinks} from 'components/link-container'
import Spinner from 'components/spinner'
import TcgLogo from 'components/tcg-logo'
import {localMessages, useMessageDispatch} from 'logic/messages'
import {
	getConnecting,
	getConnectingMessage,
	getErrorType,
} from 'logic/session/session-selectors'
import {useEffect, useRef, useState} from 'react'
import {useSelector} from 'react-redux'
import css from './login.module.scss'

const getLoginError = (errorType: string) => {
	if (!errorType) return null
	if (errorType === 'session_expired') return 'Your session has expired.'
	if (errorType === 'timeout') return 'Connection attempt took too long.'
	if (errorType === 'invalid_name') return 'Your name is not valid.'
	if (errorType === 'invalid_version')
		return 'There has been a game update. Please refresh the website.'
	if (errorType === 'xhr poll error') return "Can't reach the server."
	return errorType.substring(0, 150)
}

const Login = () => {
	const dispatch = useMessageDispatch()
	const connecting = useSelector(getConnecting)
	const errorType = useSelector(getErrorType)
	const connectingMessage = useSelector(getConnectingMessage)
	const playerNameRef = useRef<HTMLInputElement>(null)
	const [page, setPage] = useState<'login' | 'sync'>('login')

	const handlePlayerName = () => {
		if (!playerNameRef.current) return
		const name = playerNameRef.current.value
		console.log(name)
		if (name.length > 0) dispatch({type: localMessages.LOGIN, name: name})
	}

	useEffect(() => {
		window.addEventListener('keydown', handleKeyPress)
		return () => {
			window.removeEventListener('keydown', handleKeyPress)
		}
	}, [handleKeyPress])

	function handleKeyPress(e: any) {
		if (page === 'sync' || connecting) return
		if (e.key !== 'Enter') return
		handlePlayerName()
	}

	if (connecting) {
		return (
			<div className={css.loginBackground}>
				<div className={css.loginContainer}>
					<TcgLogo />
					<div className={css.connecting}>
						<Spinner />
						<p>{connectingMessage}</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className={css.loginBackground}>
			<div className={css.loginContainer}>
				<TcgLogo />
				<div className={css.text}>
					{page === 'login' && (
						<div>
							<p>
								HC TCG Online is an online version of the HC TCG game created by
								Vintage Beef for the Hermitcraft Server. If this is your first
								time playing, please enter your name and click “Play”!
							</p>
							<div className={css.nameForm}>
								<input
									maxLength={25}
									name="playerName"
									placeholder="Player Name"
									autoFocus
									id="username"
									ref={playerNameRef}
								></input>
								<Button
									variant="default"
									type="submit"
									onClick={() => handlePlayerName()}
								>
									Play
								</Button>
							</div>
						</div>
					)}
					<div className={css.clickable} onClick={() => setPage('sync')}>
						If you've already logged in on another device, click on this box to
						sync your profile.
					</div>
					{page === 'sync' && (
						<div>
							<p>These are the instructions on how to sync your account.</p>
							<div>
								<input
									maxLength={25}
									name="playerName"
									placeholder="User ID"
									autoFocus
									id="username"
								></input>
								<input
									maxLength={25}
									name="playerName"
									placeholder="Secret"
									autoFocus
									id="username"
								></input>
								<Button
									variant="default"
									type="submit"
									onClick={() => handlePlayerName()}
								>
									Sync
								</Button>
							</div>
						</div>
					)}
				</div>
				{errorType && <ErrorBanner>{getLoginError(errorType)}</ErrorBanner>}
				<VersionLinks />
				<Beef />
			</div>
		</div>
	)
}

export default Login
