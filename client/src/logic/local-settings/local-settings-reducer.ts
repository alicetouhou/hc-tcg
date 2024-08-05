import {
	LocalSettingsAction,
	localSettingsActions,
} from './local-settings-actions'

type LocalSettings = Record<string, any>

const getSettings = (): LocalSettings => {
	const storage = Object.entries(localStorage)
	const settings = storage.filter(([key]) => {
		return key.startsWith('settings:')
	})
	return settings.reduce((map, entry) => {
		const key = entry[0].replace(/^settings:/, '') as string
		const value = JSON.parse(entry[1])
		map[key] = value
		return map
	}, {} as LocalSettings)
}

const defaultState: LocalSettings = {
	soundVolume: '100',
	musicVolume: '75',
	muted: false,
	profanityFilter: 'on',
	disableChat: 'off',
	confirmationDialogs: 'on',
	showChat: 'off',
	showBattleLogs: 'off',
	showAdvancedTooltips: 'on',
	chatPosition: {x: 0, y: 0},
	chatSize: {w: 0, h: 0},
	panoramaEnabled: true,
	panorama: 'hermit-hill',
	gameSide: 'Left',
	minecraftName: 'alex',
	...getSettings(),
}

const localSettingsReducer = (
	state = defaultState,
	action: LocalSettingsAction,
): LocalSettings => {
	switch (action.type) {
		case localSettingsActions.SET_SETTING:
			return {...state, [action.key]: action.value}
		case localSettingsActions.RESET_SETTINGS:
			return {...state, [action.key]: defaultState[action.key]}
		default:
			return state
	}
}

export default localSettingsReducer
