import assert from 'assert'
import {message} from 'common/redux-actions'
import {clientMessages} from 'common/socket-messages/client-messages'
import {serverMessages} from 'common/socket-messages/server-messages'
import {LocalMessage, LocalMessageTable, actions} from 'logic/actions'
import gameSaga from 'logic/game/game-saga'
import {receiveMsg, sendMsg} from 'logic/socket/socket-saga'
import {
	call,
	cancelled,
	fork,
	put,
	race,
	take,
	takeEvery,
} from 'typed-redux-saga'

function* createPrivateGameSaga() {
	function* matchmaking() {
		try {
			// Send message to server to create the game
			yield* sendMsg({type: clientMessages.CREATE_PRIVATE_GAME})

			// Wait for response
			const createGameResponse = yield* race({
				success: call(receiveMsg(serverMessages.CREATE_PRIVATE_GAME_SUCCESS)),
				failure: call(receiveMsg(serverMessages.CREATE_PRIVATE_GAME_FAILURE)),
			})

			if (createGameResponse.success) {
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CODE_RECIEVED,
					code: createGameResponse.success.code,
				})
			} else {
				// Something went wrong, go back to menu
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CLEAR,
				})
				return
			}

			// Wait for game start or timeout
			const queueResponse = yield* race({
				gameStart: call(receiveMsg(serverMessages.GAME_START)),
				timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
			})

			if (queueResponse.gameStart) {
				yield* call(gameSaga)
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CLEAR,
				})
				yield* put<LocalMessage>({type: actions.GAME_END})
			}
		}
	}

	const result = yield* race({
		cancel: take('LEAVE_MATCHMAKING'), // We pressed the leave button
		matchmaking: call(matchmaking),
	})
	yield* put(message<LocalMessage>({type: actions.MATCHMAKING_CLEAR}))

	if (result.cancel) {
		// Tell the server the private game is cancelled
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* joinPrivateGameSaga() {
	function* matchmaking() {
		try {
			while (true) {
				const {code} = yield* take<
					LocalMessageTable[typeof actions.MATCHMAKING_CODE_SET]
				>(actions.MATCHMAKING_CODE_SET)

				yield* sendMsg({type: clientMessages.JOIN_PRIVATE_GAME, code})

				const result = yield* race({
					failure: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_FAILURE)),
					success: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_SUCCESS)),
					invalidCode: call(receiveMsg(serverMessages.INVALID_CODE)),
					waitingForPlayer: call(receiveMsg(serverMessages.WAITING_FOR_PLAYER)),
					timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
				})

				if (result.invalidCode) {
					yield* put<LocalMessage>({
						type: actions.MATCHMAKING_CODE_INVALID,
					})
					continue
				}

				if (result.failure) {
					// Something went wrong, go back to menu
					yield* put<LocalMessage>({
						type: actions.MATCHMAKING_CLEAR,
					})
				} else if (result.success || result.waitingForPlayer) {
					if (result.waitingForPlayer) {
						yield* put<LocalMessage>({
							type: actions.MATCHMAKING_WAITING_FOR_PLAYER,
						})
					}

					// Private game joined successfully - wait for game start or timeout
					const queueResponse = yield* race({
						gameStart: call(receiveMsg(serverMessages.GAME_START)),
						timeout: call(receiveMsg(serverMessages.PRIVATE_GAME_TIMEOUT)),
					})

					if (queueResponse.gameStart) {
						yield* call(gameSaga)
					}
				} else if (result.invalidCode) {
					yield* put<LocalMessage>({type: actions.MATCHMAKING_CODE_INVALID})
				}

				// For anything but invalid code, we exit loop
				break
			}
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				yield put<LocalMessage>({type: actions.GAME_END})
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CLEAR,
				})
			}
		}
	}

	const result = yield* race({
		cancel: take(actions.MATCHMAKING_CLEAR), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put(message<LocalMessage>({type: actions.MATCHMAKING_CLEAR}))

	if (result.cancel) {
		// If we are waiting for a game here - i.e. we are in the private queue - Then cancel it
		yield* sendMsg({type: clientMessages.CANCEL_PRIVATE_GAME})
	}
}

function* joinQueueSaga() {
	function* matchmaking() {
		try {
			// Send message to server to join the queue
			yield sendMsg({type: clientMessages.JOIN_QUEUE})
			console.log("A")

			// Wait for response
			const joinResponse = yield* race({
				success: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_SUCCESS)),
				failure: call(receiveMsg(serverMessages.JOIN_PRIVATE_GAME_FAILURE)),
			})

			console.log("B")
			if (joinResponse.failure) {
				// Something went wrong, go back to menu
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CLEAR,
				})
				return
			}

			// We have joined the queue, wait for game start
			yield call(receiveMsg(serverMessages.GAME_START))
			console.log("C")
			yield call(gameSaga)
			console.log('end game sagas')
		} catch (err) {
			console.error('Game crashed: ', err)
		} finally {
			if (yield* cancelled()) {
				// Clear state and back to menu
				yield* put<LocalMessage>({
					type: actions.MATCHMAKING_CLEAR,
				})
				yield put<LocalMessage>({type: actions.GAME_END})
			}
		}
	}

	const result = yield* race({
		leave: take(actions.MATCHMAKING_LEAVE), // We pressed the leave button
		matchmaking: call(matchmaking),
	})

	yield* put<LocalMessage>({type: actions.MATCHMAKING_CLEAR})

	if (result.leave) {
		// Tell the server we left the queue
		yield* sendMsg({type: clientMessages.LEAVE_QUEUE})
	}
}

function* reconnectSaga() {
	const reconnectState = yield* call(
		receiveMsg(serverMessages.GAME_STATE_ON_RECONNECT),
	)
	yield* put<LocalMessage>({type: actions.MATCHMAKING_CLEAR})
	assert(
		reconnectState.localGameState,
		'The user must be in a game when they connect',
	)
	yield* call(gameSaga, reconnectState.localGameState)
	yield* put<LocalMessage>({type: actions.MATCHMAKING_CLEAR})
}

function* matchmakingSaga() {
	yield* takeEvery(actions.MATCHMAKING_QUEUE_JOIN, joinQueueSaga)
	yield* takeEvery(
		actions.MATCHMAKING_PRIVATE_GAME_CREATE,
		createPrivateGameSaga,
	)
	yield* takeEvery(actions.MATCHMAKING_PRIVATE_GAME_JOIN, joinPrivateGameSaga)
	yield* fork(reconnectSaga)
}

export default matchmakingSaga
