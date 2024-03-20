import {AnyAction} from 'redux'
import {MatchmakingStatus} from './matchmaking-types'
import {CustomSettingsT} from 'common/types/game-state'

type MatchmakingState = {
	status: MatchmakingStatus
	code: string | null
	customSettings: CustomSettingsT
	invalidCode: boolean
}

const defaultState: MatchmakingState = {
	status: null,
	code: null,
	customSettings: {},
	invalidCode: false,
}

const matchmakingReducer = (state = defaultState, action: AnyAction): MatchmakingState => {
	switch (action.type) {
		case 'JOIN_QUEUE':
			return {
				...state,
				status: 'random_waiting',
			}
		case 'CREATE_PRIVATE_GAME':
			return {
				...state,
				status: 'loading',
			}
		case 'JOIN_PRIVATE_GAME':
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: false,
			}
		case 'WAITING_FOR_PLAYER':
			return {
				...state,
				status: 'waiting_for_player',
			}
		case 'CODE_RECEIVED':
			return {
				...state,
				code: action.payload,
				status: 'private_waiting',
			}
		case 'INVALID_CODE':
			return {
				...state,
				status: 'private_code_needed',
				invalidCode: true,
			}
		case 'SET_MATCHMAKING_CODE':
			return {
				...state,
				code: action.payload,
				status: 'loading',
			}
		case 'SET_CUSTOM_SETTINGS':
			return {
				...state,
				customSettings: action.payload,
			}
		case 'DISCONNECT':
		case 'GAME_STATE':
		case 'LEAVE_MATCHMAKING':
			return {
				...state,
				code: null,
				customSettings: {},
				status: null,
				invalidCode: false,
			}
		case 'CLEAR_MATCHMAKING':
			return {
				...state,
				code: null,
				customSettings: {},
				status: null,
				invalidCode: false,
			}
		case 'PLAYER_CONFIRMATION':
			return {
				...state,
				status: 'player_confirmation',
			}
		case 'CONFIRM_PRIVATE_GAME':
			return {
				...state,
				status: 'confirmation_waiting',
			}
		case 'GAME_START':
			return {
				...state,
				status: 'starting',
			}
		default:
			return state
	}
}

export default matchmakingReducer
