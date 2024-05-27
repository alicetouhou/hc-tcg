import Modal from 'components/modal'
import {useDispatch, useSelector} from 'react-redux'
import css from './game-modals.module.scss'
import {modalRequest} from 'logic/game/game-actions'
import {HERMIT_CARDS} from 'common/cards'
import Attack from './attack-modal/attack'
import {getGameState} from 'logic/game/game-selectors'
import {ModalData} from 'common/types/game-state'
import {RowPos} from 'common/types/cards'

type Props = {
	closeModal: () => void
}
function CopyAttackModal({closeModal}: Props) {
	const dispatch = useDispatch()

	const modalData: ModalData | null | undefined = useSelector(getGameState)?.currentModalData
	if (!modalData) return null
	const rowPos: RowPos = modalData.payload.cardPos

	if (rowPos.rowIndex === null || !rowPos.row.hermitCard) return null

	const hermitFullName = rowPos.row.hermitCard.id.split('_')[0]

	const handlePrimary = () => {
		dispatch(modalRequest({modalResult: {pick: 'primary'}}))
		closeModal()
	}

	const handleSecondary = () => {
		dispatch(modalRequest({modalResult: {pick: 'secondary'}}))
		closeModal()
	}

	const handleClose = () => {
		dispatch(modalRequest({modalResult: {cancel: true}}))
		closeModal()
	}

	return (
		<Modal closeModal={handleClose} title={modalData.payload.modalName}>
			<div className={css.confirmModal}>
				<div className={css.description}>{modalData.payload.modalDescription}</div>
				<div className={css.description}>
					<Attack
						key="primary"
						name={rowPos.row.hermitCard.primary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={rowPos.row.hermitCard.primary}
						onClick={handlePrimary}
					/>
					<Attack
						key="secondary"
						name={rowPos.row.hermitCard.secondary.name}
						icon={`/images/hermits-nobg/${hermitFullName}.png`}
						attackInfo={rowPos.row.hermitCard.secondary}
						onClick={handleSecondary}
					/>
				</div>
			</div>
		</Modal>
	)
}

export default CopyAttackModal
