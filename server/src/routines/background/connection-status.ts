import {ViewerComponent} from 'common/components/viewer-component'
import {CONFIG} from 'common/config'
import {GameModel} from 'common/models/game-model'
import {PlayerModel} from 'common/models/player-model'
import {serverMessages} from 'common/socket-messages/server-messages'
import {localMessages} from 'messages'
import {AnyAction} from 'redux'
import {delay, takeEvery} from 'typed-redux-saga'
import {getOpponentId} from '../../utils'
import {broadcast} from '../../utils/comm'
import {getLocalGameState} from '../../utils/state-gen'

function* sendGameStateOnReconnect(game: GameModel, action: AnyAction) {
	const playerId = action.payload.internalId
	const player = game.players[playerId]
	const opponentId = getOpponentId(game, playerId)
	const opponent = game.players[opponentId]

	yield* delay(500)

	if (game.state.timer.turnStartTime) {
		const maxTime = CONFIG.limits.maxTurnTime * 1000
		const remainingTime = game.state.timer.turnStartTime + maxTime - Date.now()
		const graceTime = 1000
		game.state.timer.turnRemaining = remainingTime + graceTime
	}

	let viewer = game.components.find(
		ViewerComponent,
		(_game, viewer) => viewer.playerId === player.id,
	)

	if (!viewer) {
		console.error('Player tried to connect with invalid player id')
		return
	}

	broadcast([player], {
		type: serverMessages.GAME_STATE_ON_RECONNECT,
		localGameState: getLocalGameState(game, viewer),
		order: game.getPlayers().map((player) => player.id),
	})
	broadcast([opponent], {
		type: serverMessages.OPPONENT_CONNECTION,
		isConnected: opponent.socket?.connected,
	})
}

function* statusChangedSaga(game: GameModel, action: AnyAction) {
	const playerId = (action.payload as PlayerModel).id
	const opponentId = getOpponentId(game, playerId)
	const connectionStatus = game.players[playerId]?.socket.connected
	broadcast([game.players[opponentId]], {
		type: serverMessages.OPPONENT_CONNECTION,
		isConnected: connectionStatus,
	})
}

function* connectionStatusSaga(game: GameModel) {
	yield* takeEvery(
		(action: any) =>
			action.type === localMessages.PLAYER_RECONNECTED &&
			!!game.players[(action.payload as PlayerModel).id],
		sendGameStateOnReconnect,
		game,
	)

	yield* takeEvery(
		(action: any) =>
			[
				localMessages.PLAYER_DISCONNECTED,
				localMessages.PLAYER_RECONNECTED,
			].includes(action.type) &&
			!!game.players[(action.payload as PlayerModel).id],
		statusChangedSaga,
		game,
	)
}

export default connectionStatusSaga
