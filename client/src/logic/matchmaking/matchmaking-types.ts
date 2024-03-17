export type MatchmakingStatus =
	| 'loading'
	| 'random_waiting'
	| 'private_waiting'
	| 'waiting_for_player'
	| 'private_code_needed'
	| 'player_confirmation'
	| 'confirmation_waiting'
	| 'starting'
	| null
