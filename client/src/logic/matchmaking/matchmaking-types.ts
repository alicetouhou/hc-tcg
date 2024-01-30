export type MatchmakingStatus =
	| 'loading'
	| 'random_waiting'
	| 'pve_waiting'
	| 'private_waiting'
	| 'waiting_for_player'
	| 'private_code_needed'
	| 'starting'
	| null
