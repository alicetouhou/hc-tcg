import * as CheckboxRadix from '@radix-ui/react-checkbox'
import css from './checkbox.module.scss'

interface CheckboxProps {
	defaultChecked: boolean
	onCheck: () => void
	onUncheck: () => void
}

const Checkbox = (props: CheckboxProps) => {
	const onCheck = (e: string | boolean) => {
		if (e === true) {
			props.onCheck()
			return
		} else if (e === false) {
			props.onUncheck()
		}
	}

	return (
		<CheckboxRadix.Root
			className={css.CheckboxRoot}
			defaultChecked={props.defaultChecked}
			disabled={false}
			onCheckedChange={(e) => onCheck(e)}
		>
			<CheckboxRadix.Indicator className={css.CheckboxIndicator}>X</CheckboxRadix.Indicator>
		</CheckboxRadix.Root>
	)
}

export default Checkbox
