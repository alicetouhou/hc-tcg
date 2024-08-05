import {getSession} from 'logic/session/session-selectors'
import {SagaIterator} from 'redux-saga'
import {eventChannel} from 'redux-saga'
import {put, takeEvery} from 'redux-saga/effects'
import socket from 'socket'
import {select} from 'typed-redux-saga'
import {
	socketConnect,
	socketConnectError,
	socketDisconnect,
} from './socket-actions'
import {ServerMessageTable} from 'common/socket-messages/server-messages'
import {ClientMessage} from 'common/socket-messages/client-messages'

export function* sendMsg(payload: ClientMessage): any {
	while (true) {
		if (socket.connected) {
			console.log('[send]', payload.type, payload)
			const {playerId, playerSecret} = yield* select(getSession)
			socket.emit(payload.type, {
				type: payload.type,
				payload,
				playerId,
				playerSecret,
			})
			break
		}
		yield new Promise((resolve: any) => {
			socket.once('connect', resolve)
		})
	}
}

export function receiveMsg<T extends keyof ServerMessageTable>(type: T) {
	return () => {
		return new Promise<ServerMessageTable[T]>((resolve) => {
			const listener = (message: ServerMessageTable[T]) => {
				resolve(message)
			}
			socket.once(type as string, listener as any)
		})
	}
}

function* socketSaga(): SagaIterator {
	const channel = eventChannel((emitter: any): any => {
		const connectListener = () => emitter('connect')
		const disconnectListener = () => emitter('disconnect')
		const connectErrorListener = () => emitter('connect_error')
		socket.on('connect', connectListener)
		socket.on('disconnect', disconnectListener)
		socket.on('connect_error', connectErrorListener)
		return () => {
			socket.off('connect', connectListener)
			socket.off('disconnect', disconnectListener)
			socket.off('connect_error', connectErrorListener)
		}
	})
	yield takeEvery(channel, function* (type) {
		console.log('@socket: ', type)
		if (type === 'connect') yield put(socketConnect())
		if (type === 'disconnect') yield put(socketDisconnect())
		if (type === 'connect_error') yield put(socketConnectError())
	})
}

export default socketSaga
