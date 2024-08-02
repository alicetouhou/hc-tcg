import Background from 'components/background'
import LostConnection from 'components/lost-connection'
import Toast from 'components/toast'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import {getPlayerName, getToast} from 'logic/session/session-selectors'
import {getSocketStatus} from 'logic/socket/socket-selectors'
import {sectionChange} from 'logic/sound/sound-actions'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useRouter} from './app-hooks'
import Deck from './deck'
import Game from './game'
import Login from './login'
import MainMenu from './main-menu'
import Credits from './main-menu/credits'
import DataSettings from './main-menu/data-settings'
import GameSettings from './main-menu/game-settings'
import Settings from './main-menu/settings'
import MatchMaking from './match-making'

function App() {
	const section = useRouter()
	const dispatch = useDispatch()
	const playerName = useSelector(getPlayerName)
	const socketStatus = useSelector(getSocketStatus)
	const toastMessage = useSelector(getToast)
	const settings = useSelector(getSettings)
	const [menuSection, setMenuSection] = useState<string>('mainmenu')
	let enableToast = false

	useEffect(() => {
		dispatch(sectionChange(section))
	}, [section])

	const router = () => {
		if (section === 'game') {
			return <Game />
		} else if (section === 'matchmaking') {
			return <MatchMaking />
		} else if (playerName) {
			enableToast = true
			switch (menuSection) {
				case 'deck':
					return <Deck setMenuSection={setMenuSection} />
				case 'settings':
					return <Settings setMenuSection={setMenuSection} />
				case 'game-settings':
					return <GameSettings setMenuSection={setMenuSection} />
				case 'data-settings':
					return <DataSettings setMenuSection={setMenuSection} />
				case 'credits':
					return <Credits setMenuSection={setMenuSection} />
				case 'mainmenu':
				default:
					return <MainMenu setMenuSection={setMenuSection} />
			}
		}
		return <Login />
	}

	const background = useMemo(() => {
		return (
			<Background
				panorama={settings.panorama}
				disabled={!settings.panoramaEnabled}
			/>
		)
	}, [settings.panoramaEnabled])

	return (
		<main>
			{background}
			{router()}
			{playerName && !socketStatus && <LostConnection />}
			{enableToast && (
				<Toast
					title={toastMessage.title}
					description={toastMessage.description}
					image={toastMessage.image}
					setOpen={toastMessage.open}
				/>
			)}
		</main>
	)
}

export default App
