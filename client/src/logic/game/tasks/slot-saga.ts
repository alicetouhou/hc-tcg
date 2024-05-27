import {select} from 'typed-redux-saga'
import {put, takeLeading, call, take, putResolve} from 'redux-saga/effects'
import {SagaIterator} from 'redux-saga'
import {
	ChangeActiveHermitActionData,
	PickCardActionData,
	PlayCardActionData,
	slotToPlayCardAction,
} from 'common/types/action-data'
import {CARDS} from 'common/cards'
import {getPlayerId} from 'logic/session/session-selectors'
import {
	getAvailableActions,
	getSelectedCard,
	getPlayerState,
	getCurrentPickMessage,
} from 'logic/game/game-selectors'
import {setSelectedCard, setOpenedModal, removeEffect, slotPicked} from 'logic/game/game-actions'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import Card from 'common/cards/base/card'

type SlotPickedAction = ReturnType<typeof slotPicked>

function* pickForPickRequestSaga(action: SlotPickedAction): SagaIterator {
	const currentPickRequest = yield* select(getCurrentPickMessage)
	if (!currentPickRequest) return

	const pickInfo = action.payload.pickInfo

	const actionData: PickCardActionData = {
		type: 'PICK_REQUEST',
		payload: {
			pickResult: pickInfo,
		},
	}

	yield put(actionData)
}

function* pickWithSelectedSaga(action: SlotPickedAction, selectedCard: Card): SagaIterator {
	const pickInfo = action.payload.pickInfo

	yield putResolve(setSelectedCard(null))

	// If the hand is clicked don't send data
	if (pickInfo.slot.type !== 'hand') {
		if (!selectedCard) {
			// Validations
			console.log('Unknown card id: ', selectedCard)
			return
		}

		const actionType = slotToPlayCardAction[pickInfo.slot.type]
		if (!actionType) return

		const actionData: PlayCardActionData = {
			type: actionType,
			payload: {pickInfo, card: selectedCard},
		}

		yield put(actionData)
	}
}

function* pickWithoutSelectedSaga(action: SlotPickedAction): SagaIterator {
	const {playerId, rowIndex, slot} = action.payload.pickInfo

	if (slot.type !== 'hermit') return

	const currentPlayerId = yield* select(getPlayerId)
	const playerState = yield* select(getPlayerState)
	const settings = yield* select(getSettings)

	if (!playerState || rowIndex === undefined) return
	const row = playerState.board.rows[rowIndex]
	if (!row.hermitCard) return

	if (playerId !== currentPlayerId) return

	if (playerState.board.activeRow === rowIndex) {
		yield put(setOpenedModal('attack'))
	} else {
		if (settings.confirmationDialogs !== 'off') {
			yield put(setOpenedModal('change-hermit-modal', action.payload.pickInfo))
			const result = yield take('CONFIRM_HERMIT_CHANGE')
			if (!result.payload) return
		}

		const data: ChangeActiveHermitActionData = {
			type: 'CHANGE_ACTIVE_HERMIT',
			payload: {
				pickInfo: action.payload.pickInfo,
			},
		}
		yield put(data)
	}
}

function* slotPickedSaga(action: SlotPickedAction): SagaIterator {
	const availableActions = yield* select(getAvailableActions)
	const selectedCard = yield* select(getSelectedCard)
	if (availableActions.includes('WAIT_FOR_TURN')) return

	if (action.payload.pickInfo.slot.type === 'single_use') {
		const playerState = yield* select(getPlayerState)
		if (playerState?.board.singleUseCard && !playerState?.board.singleUseCardUsed) {
			yield put(removeEffect())
			return
		}
	}

	if (availableActions.includes('PICK_REQUEST')) {
		// Run a seperate saga for the pick request
		yield call(pickForPickRequestSaga, action)
		return
	}

	if (selectedCard) {
		yield call(pickWithSelectedSaga, action, selectedCard)
	} else {
		yield call(pickWithoutSelectedSaga, action)
	}
}

function* slotSaga(): SagaIterator {
	yield takeLeading('SLOT_PICKED', slotPickedSaga)
}

export default slotSaga
