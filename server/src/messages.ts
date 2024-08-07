import {PlayerId, PlayerModel} from 'common/models/player-model'
import {Message, MessageTable, messages} from 'common/redux-actions'
import {PlayerDeckT} from 'common/types/deck'

export const localMessages = messages({
	CLIENT_CONNECTED: null,
	CLIENT_DISCONNECTED: null,
	PLAYER_CONNECTED: null,
	PLAYER_DISCONNECTED: null,
	PLAYER_RECONNECTED: null,
	PLAYER_REMOVED: null,
})

type Messages = [
	{
		type: typeof localMessages.CLIENT_CONNECTED
		playerId: PlayerId
		playerName: string
		playerSecret: string
		minecraftName: string
		deck: PlayerDeckT
		socket: any
	},
	{type: typeof localMessages.CLIENT_DISCONNECTED; socket: any},
	{type: typeof localMessages.PLAYER_CONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_DISCONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_RECONNECTED; player: PlayerModel},
	{type: typeof localMessages.PLAYER_REMOVED; player: PlayerModel},
]

export type LocalMessage = Message<Messages>

/** A message used locally on the client to update global state */
export type LocalMessageTable = MessageTable<Messages>
