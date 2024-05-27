import Card from '../cards/base/card'
import {GameModel} from '../models/game-model'

export type HermitAttackType = 'primary' | 'secondary' | 'single-use'

export type AttackType = HermitAttackType | 'effect' | 'weakness' | 'status-effect'

export type WeaknessType = 'always' | 'ifWeak' | 'never'

export type AttackDefence = {
	damageReduction: number
}

export type ShouldIgnoreCard = (instance: string) => boolean

export type AttackLogFactory = {
	attacker: string
	attackName: string
	player: string
	opponent: string
	target: string
	damage: string
	header: string
	coinFlip: string | null
}

export type AttackDefs = {
	game: GameModel
	creator: Creator | null
	attacker?: Card | null
	target?: Card | null
	type: AttackType
	shouldIgnoreCards?: Array<ShouldIgnoreCard>
	isBacklash?: boolean
	createWeakness?: WeaknessType
	log?: (values: AttackLogFactory) => string
}

export type Creator = {
	id: string
	instance: string
}

export type AttackHistoryType =
	| 'creator'
	| 'add_damage'
	| 'reduce_damage'
	| 'multiply_damage'
	| 'lock_damage'
	| 'set_attacker'
	| 'set_target'

export type AttackHistory = {
	sourceId: string
	type: AttackHistoryType
	value?: any
}
