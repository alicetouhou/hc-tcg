export type JoinQueueAction = {
	type: 'JOIN_QUEUE'
}

export const joinQueue = () => ({
	type: 'JOIN_QUEUE' as const,
})

export const createPrivateGame = (customSettings: Record<string, any> | null) => ({
	type: 'CREATE_PRIVATE_GAME' as const,
	payload: customSettings,
})

export const joinPrivateGame = () => ({
	type: 'JOIN_PRIVATE_GAME' as const,
})

export const codeReceived = (code: string) => ({
	type: 'CODE_RECEIVED' as const,
	payload: code,
})

export const leaveMatchmaking = () => ({
	type: 'LEAVE_MATCHMAKING' as const,
})

export const clearMatchmaking = () => ({
	type: 'CLEAR_MATCHMAKING' as const,
})

export const setCode = (gameCode: string | null) => ({
	type: 'SET_MATCHMAKING_CODE' as const,
	payload: gameCode,
})

export const setCustomSettings = (customSettings: Record<string, any> | null) => ({
	type: 'SET_CUSTOM_SETTINGS' as const,
	payload: customSettings,
})

export const invalidCode = () => ({
	type: 'INVALID_CODE' as const,
})

export const waitingForPlayer = () => ({
	type: 'WAITING_FOR_PLAYER' as const,
})

export const playerConfirmation = (customSettings: Record<string, any> | null) => ({
	type: 'PLAYER_CONFIRMATION' as const,
	payload: customSettings,
})

export const startPrivateGame = (gameCode: string | null) => ({
	type: 'CONFIRM_PRIVATE_GAME' as const,
	payload: gameCode,
})
