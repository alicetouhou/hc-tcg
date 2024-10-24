import * as AlertDialog from '@radix-ui/react-alert-dialog'
import ModalCSS from 'components/alert-modal/alert-modal.module.scss'
import {CopyIcon} from 'components/svgs'
import css from './import-export.module.scss'
import {Deck} from 'common/types/database'
import {useSelector} from 'react-redux'
import {getLocalDatabaseInfo} from 'logic/game/database/database-selectors'

type Props = {
	setOpen: boolean
	onClose: (isOpen: boolean) => void
	loadedDeck: Deck
}

export const ExportModal = ({setOpen, onClose, loadedDeck}: Props) => {
	const databaseInfo = useSelector(getLocalDatabaseInfo)
	const decks = databaseInfo.decks
	const currentDeck = decks.find((deck) => deck.name === loadedDeck.name)
	const code = currentDeck ? currentDeck.code : 'Please Re-open this window...'

	return (
		<AlertDialog.Root open={setOpen} onOpenChange={(e) => onClose(e)}>
			<AlertDialog.Portal container={document.getElementById('modal')}>
				<AlertDialog.Overlay className={ModalCSS.AlertDialogOverlay} />
				<AlertDialog.Content className={ModalCSS.AlertDialogContent}>
					<AlertDialog.Title className={ModalCSS.AlertDialogTitle}>
						Export Deck
						<AlertDialog.Cancel asChild>
							<button className={ModalCSS.xClose}>
								<img src="/images/CloseX.svg" alt="close" />
							</button>
						</AlertDialog.Cancel>
					</AlertDialog.Title>
					<AlertDialog.Description
						asChild
						className={ModalCSS.AlertDialogDescription}
					>
						<div>
							{/* EXPORT SECTION */}
							<div>
								<p className={css.instructions}>
									Export the "{loadedDeck.name}" deck to share with your
									friends!
								</p>
								<div className={css.exportControls}>
									<input type="text" readOnly value={code} />
									<button
										className={css.copy}
										onClick={() => {
											navigator.clipboard.writeText(code)
										}}
									>
										{CopyIcon()}
									</button>
								</div>
							</div>
						</div>
					</AlertDialog.Description>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
