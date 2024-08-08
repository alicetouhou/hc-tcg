import {LocalMessage, localMessages} from 'logic/messages'

export type LocalSettings = {
	soundVolume: number
	musicVolume: number
	muted: boolean
	profanityFilter: boolean
	showChat: boolean
	disableChat: boolean
	confirmationDialogs: boolean
	showBattleLogs: boolean
	showAdvancedTooltips: boolean
	chatPosition: {x: number; y: number}
	chatSize: {w: number; h: number}
	panoramaEnabled: boolean
	panorama: string
	gameSide: string
	minecraftName: string
}

export type LocalSetting = {
	[Key in keyof LocalSettings]: {key: Key; value: LocalSettings[Key]}
}[keyof LocalSettings]

const defaultSettings: LocalSettings = {
	soundVolume: 100,
	musicVolume: 75,
	muted: false,
	profanityFilter: true,
	disableChat: false,
	confirmationDialogs: true,
	showChat: false,
	showBattleLogs: false,
	showAdvancedTooltips: true,
	chatPosition: {x: 0, y: 0},
	chatSize: {w: 0, h: 0},
	panoramaEnabled: true,
	panorama: 'hermit-hill',
	gameSide: 'Left',
	minecraftName: 'alex',
}

const getSettings = (): LocalSettings => {
	const storage = Object.entries(localStorage)

	const settings = storage.filter(([key]) => {
		return key.startsWith('settings:')
	})

	return settings.reduce((map, entry) => {
		const key = entry[0].replace(/^settings:/, '')
		const value = JSON.parse(entry[1])
		// @ts-ignore
		map[key] = value
		return map
	}, {} as LocalSettings)
}

const defaultState: LocalSettings = {...defaultSettings, ...getSettings()}

const localSettingsReducer = (
	state = defaultState,
	action: LocalMessage,
): LocalSettings => {
	switch (action.type) {
		case localMessages.SETTINGS_SET:
			return {...state, [action.setting.key]: action.setting.value}
		case localMessages.SETTINGS_RESET:
			return {
				...state,
				[action.key]: defaultState[action.key as keyof LocalSettings],
			}
		default:
			return state
	}
}

export default localSettingsReducer
