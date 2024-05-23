import {SyntheticEvent, useState} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {
	getChatMessages,
	getOpponentId,
	getOpponentName,
	getPlayerStates,
} from 'logic/game/game-selectors'
import {chatMessage} from 'logic/game/game-actions'
import {getPlayerId} from 'logic/session/session-selectors'
import {getSettings} from 'logic/local-settings/local-settings-selectors'
import css from './chat.module.scss'
import formatCss from '../../../components/formatting/formatting.module.scss'
import Button from 'components/button'
import {setSetting} from 'logic/local-settings/local-settings-actions'
import {useDrag} from '@use-gesture/react'
import {FormattedText} from 'components/formatting/formatting'
import classNames from 'classnames'

function Chat() {
	const dispatch = useDispatch()
	const settings = useSelector(getSettings)
	const chatMessages = settings.disableChat === 'off' ? useSelector(getChatMessages) : []
	const playerStates = useSelector(getPlayerStates)
	const playerId = useSelector(getPlayerId)
	const opponent = useSelector(getOpponentName)
	const chatPos = settings.chatPosition
	const chatSize = settings.chatSize
	const showLog = settings.showBattleLogs
	const opponentId = useSelector(getOpponentId)

	const bindChatPos = useDrag((params: any) => {
		dispatch(
			setSetting('chatPosition', {
				x: params.offset[0],
				y: params.offset[1],
			})
		)
	})

	if (settings.showChat !== 'on') return null

	const handleNewMessage = (ev: SyntheticEvent<HTMLFormElement>) => {
		ev.preventDefault()
		const form = ev.currentTarget
		const messageEl = form.message as HTMLInputElement
		const message = messageEl.value.trim()
		messageEl.value = ''
		messageEl.focus()
		if (message.length === 0) return
		dispatch(chatMessage(message))
	}

	const closeChat = () => {
		dispatch(setSetting('showChat', 'off'))
	}

	// @TODO: Repopulate chat messages after reconnecting
	return (
		<div
			className={css.chat}
			style={{
				top: chatPos.y,
				left: chatPos.x,
				width: chatSize.w !== 0 ? chatSize.w : '94vw',
				height: chatSize.h !== 0 ? chatSize.h : '50vh',
			}}
			onClick={(e) => {
				console.log(e)
				dispatch(
					setSetting('chatSize', {
						w: e.currentTarget.offsetWidth,
						h: e.currentTarget.offsetHeight,
					})
				)
			}}
		>
			<div className={css.header} {...bindChatPos()}>
				<p>Chatting with {opponent}</p>
				<Button onClick={() => dispatch(setSetting('showBattleLogs', !showLog))} size="small">
					{showLog ? 'Hide Battle Log' : 'Show Battle Log'}
				</Button>
				<button onClick={closeChat} className={css.close}>
					<img src="/images/CloseX.svg" alt="close" />
				</button>
			</div>

			<div className={css.messagesWrapper}>
				<div className={css.messages}>
					{chatMessages.slice().map((line) => {
						if (line.systemMessage === true && showLog === false) return <span></span>
						const hmTime = new Date(line.createdAt).toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
						})

						const opponent = playerId !== line.sender
						const name = playerStates?.[line.sender]?.playerName
						const opponentName = opponentId ? playerStates?.[opponentId].playerName : null
						if (line.message.TYPE === 'LineNode') {
							return (
								<div className={css.message}>
									<span className={css.turnTag}>
										{opponent ? `${opponentName}'s`.toLocaleUpperCase() : 'YOUR'} TURN
									</span>
									<span className={css.line}></span>
								</div>
							)
						}

						return (
							<div className={css.message}>
								{line.message.TYPE !== 'LineNode' && <span className={css.time}>{hmTime}</span>}
								{name && !line.systemMessage && (
									<span
										className={classNames(
											css.playerName,
											opponent ? formatCss.player : formatCss.opponent
										)}
									>
										{name}
									</span>
								)}
								<span className={classNames(line.systemMessage ? css.systemMessage : css.text)}>
									{FormattedText(line.message, opponent)}
								</span>
							</div>
						)
					})}
				</div>
			</div>

			<form className={css.publisher} onSubmit={handleNewMessage}>
				<input autoComplete="off" autoFocus name="message" maxLength={140} />
				<Button variant="default" size="small">
					Send
				</Button>
			</form>
		</div>
	)
}

export default Chat
