import CARDS from '../../cards'
import {applySingleUse} from '../../utils'
import {getDerivedState} from '../../utils/derived-state'

// TODO - You can "apply effect" by putting it on in the slot, then selecting another clicking the slotteded one and confirmiing modal
function* applyEffectSaga(game, turnAction, baseDerivedState) {
	// TODO - This shouldn't be needed
	turnAction.payload = turnAction.payload || {}

	const {currentPlayer} = baseDerivedState
	const derivedState = getDerivedState(game, turnAction, baseDerivedState)
	const {singleUseInfo} = derivedState

	if (!singleUseInfo) return 'INVALID'

	const applyEffectResult = game.hooks.applyEffect.call(
		turnAction,
		derivedState
	)

	if (applyEffectResult === 'INVALID') {
		console.log('Validation failed for: ', singleUseInfo?.id)
		return 'INVALID'
	} else if (applyEffectResult === 'DONE') {
		currentPlayer.board.singleUseCardUsed = true
		return 'DONE'
	} else if (applyEffectResult) {
		currentPlayer.board.singleUseCardUsed = true
		currentPlayer.followUp = applyEffectResult
		return 'DONE'
	}

	console.log('Effect not implemented: ', singleUseInfo?.id)
	delete currentPlayer.followUp
	return 'INVALID'
}

export default applyEffectSaga
