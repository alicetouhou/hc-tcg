import {hermit} from '../../defaults'
import {Hermit} from '../../types'

const PostmasterPearlCommon: Hermit = {
	...hermit,
	id: 'postmasterpearl_common',
	numericId: 84,
	name: 'Postmaster',
	expansion: 'default',
	rarity: 'common',
	tokens: 0,
	type: 'builder',
	health: 270,
	primary: {
		name: '5 AM',
		cost: ['any'],
		damage: 40,
		power: null,
	},
	secondary: {
		name: "What's This?",
		cost: ['builder', 'builder', 'any'],
		damage: 90,
		power: null,
	},
}

export default PostmasterPearlCommon
