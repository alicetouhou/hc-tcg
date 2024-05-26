import {
	AttackHistory,
	AttackHistoryType,
	AttackDefs,
	AttackType,
	ShouldIgnoreCard,
	WeaknessType,
	AttackLogFactory,
} from '../types/attack'
import {CardT} from '../types/game-state'
import {BasicHermitCardPos, getHermitCardPos} from './card-pos-model'
import {GameModel} from './game-model'

export class AttackModel {
	/** The damage this attack does */
	private damage: number = 0
	/** The damage multiplier */
	private damageMultiplier: number = 1
	/** The damage reduction */
	private damageReduction: number = 0
	/** Is the damage on this attack changeable? */
	private damageLocked: boolean = false
	/** The list of all changes made to this attack */
	private history: Array<AttackHistory> = []

	/** The attacker */
	private attacker: BasicHermitCardPos | null
	/** The attack target */
	private target: BasicHermitCardPos | null
	/** Game attached to this attack model*/
	private game: GameModel

	/** The battle log attached to this attack */
	public log: ((values: AttackLogFactory) => string) | null

	// Public fields

	/** The attack type */
	public type: AttackType
	/** Attacks to perform after this attack */
	public nextAttacks: Array<AttackModel> = []
	/** Array of checks to filter out hooks this attack should not trigger */
	public shouldIgnoreCards: Array<ShouldIgnoreCard> = []
	/** Is this attack a backlash attack*/
	public isBacklash: boolean = false
	/** Whether or not the attack should create a weakness attack */
	public createWeakness: WeaknessType

	constructor(defs: AttackDefs) {
		this.type = defs.type
		this.isBacklash = defs.isBacklash || false
		this.game = defs.game

		this.attacker = defs.attacker ? getHermitCardPos(defs.game, defs.attacker.cardInstance) : null
		this.target = defs.target ? getHermitCardPos(defs.game, defs.target.cardInstance) : null
		this.shouldIgnoreCards = defs.shouldIgnoreCards || []
		this.createWeakness = defs.createWeakness || 'never'
		this.log = defs.log ? defs.log : null

		if (defs.creator) this.addHistory(defs.creator.cardId, 'creator', defs.creator)

		return this
	}

	// Helpers

	/** Adds a change to the attack's history */
	private addHistory(sourceId: string, type: AttackHistoryType, value?: any) {
		this.history.push({
			sourceId,
			type,
			value,
		})
	}

	/** Returns true if one of the passed in types are this attacks type */
	public isType(...types: Array<AttackType>) {
		return types.includes(this.type)
	}

	/** Calculates the damage for this attack */
	public calculateDamage() {
		return Math.max(this.damage * this.damageMultiplier - this.damageReduction, 0)
	}

	// Getters

	/** Returns the damage this attack will do */
	public getDamage() {
		return this.damage
	}
	/** Returns the damage multiplier for this attack */
	public getDamageMultiplier() {
		return this.damageMultiplier
	}
	/** Returns the history of changes to this attack, optionally filtered by type */
	public getHistory(type?: AttackHistoryType) {
		if (type) {
			return this.history.filter((history) => history.type == type)
		}
		return this.history
	}
	/** Returns the instance of creator of this attack */
	public getCreator() {
		return (this.getHistory('creator')[0].value as CardT).cardInstance
	}
	/** Returns the current attacker for this attack */
	public getAttacker() {
		return this.attacker
	}
	/** Returns the current target for this attack */
	public getTarget() {
		return this.target
	}
	/** Returns the game this attack is from */
	public getGame() {
		return this.game
	}

	// Setters / modifier methods

	/** Increases the damage the attack does */
	public addDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damage += amount

		this.addHistory(sourceId, 'add_damage', amount)

		return this
	}

	/** Reduces the damage the attack does */
	public reduceDamage(sourceId: string, amount: number) {
		if (this.damageLocked) return this
		this.damageReduction += amount

		this.addHistory(sourceId, 'reduce_damage', amount)

		return this
	}

	/** Multiplies the damage the attack does */
	public multiplyDamage(sourceId: string, multiplier: number) {
		if (this.damageLocked) return this
		this.damageMultiplier = Math.max(this.damageMultiplier * multiplier, 0)

		this.addHistory(sourceId, 'multiply_damage', multiplier)
		return this
	}

	/** Sets the attacker for this attack */
	public setAttacker(sourceId: string, attacker: string | null) {
		this.attacker = attacker ? getHermitCardPos(this.game, attacker) : null

		this.addHistory(sourceId, 'set_attacker', attacker)
		return this
	}
	/** Sets the target for this attack */
	public setTarget(sourceId: string, target: string | null) {
		this.target = target ? getHermitCardPos(this.game, target) : null

		this.addHistory(sourceId, 'set_target', target)
		return this
	}

	/**
	 * Locks damage for this attack
	 *
	 * WARNING: Do not use lightly!
	 */
	public lockDamage(sourceId: string) {
		this.damageLocked = true

		this.addHistory(sourceId, 'lock_damage')
		return this
	}

	/** Adds a new attack to be executed after this one */
	public addNewAttack(newAttack: AttackModel) {
		this.nextAttacks.push(newAttack)
		return this
	}
}
