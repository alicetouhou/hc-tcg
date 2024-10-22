import classNames from 'classnames'
import React, {memo, useEffect, useRef, useState} from 'react'
import css from './tooltip.module.scss'

type Props = {
	children: React.ReactElement
	tooltip: React.ReactNode
	showAboveModal?: boolean
}

const Tooltip = memo(({children, tooltip, showAboveModal}: Props) => {
	const [open, setOpen] = useState<boolean>(false)
	const childRef = useRef<HTMLDivElement>(null)
	const tooltipRef = useRef<HTMLDivElement>(null)

	const [childrenRect, setChildrenRect] = useState<DOMRect | null>(null)
	const [parentRect, setParentRect] = useState<DOMRect | null>(null)
	const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)

	function onSetOpen(newOpen: boolean) {
		const childrenCoordinates = childRef.current?.getBoundingClientRect()
		const parentCoordinates =
			childRef.current?.parentElement?.parentElement?.getBoundingClientRect()
		if (childrenCoordinates === undefined || parentCoordinates === undefined) {
			setOpen(false)
			return
		}

		setChildrenRect(childrenCoordinates)
		setParentRect(parentCoordinates)
		setOpen(newOpen)
	}

	const childrenContainer = (
		<div
			ref={childRef}
			onPointerOver={() => onSetOpen(true)}
			onPointerOut={() => onSetOpen(false)}
		>
			{children}
		</div>
	)

	const top =
		childrenRect !== null && parentRect !== null
			? childrenRect.y - parentRect.y - 30
			: 0
	const left =
		childrenRect !== null && parentRect !== null
			? childrenRect.x - parentRect.x
			: 0

	if (open) {
		return (
			<>
				<div
					className={classNames(
						css.tooltip,
						showAboveModal && css.showAboveModal,
					)}
					style={{
						position: 'fixed',
						top: top,
						left: left,
					}}
					ref={tooltipRef}
				>
					{tooltip}
				</div>
				{childrenContainer}
			</>
		)
	}

	return childrenContainer
})

export default Tooltip
