import classNames from 'classnames'
import React, {memo, useReducer, useRef, useState} from 'react'
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
	const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
	const [top, setTop] = useState<number>(0)
	const [left, setLeft] = useState<number>(0)

	function onSetOpen(newOpen: boolean) {
		if (newOpen === false) {
			setChildrenRect(null)
			setTooltipRect(null)
			setOpen(false)
			return
		}
		const childrenCoordinates = childRef.current?.getBoundingClientRect()
		const tooltipCoordinates = tooltipRef.current?.getBoundingClientRect()
		if (childrenCoordinates === undefined) {
			setOpen(false)
			return
		}

		if (tooltipCoordinates === undefined) {
			setOpen(true)
			onSetOpen(newOpen)
			return
		}

		setChildrenRect(childrenCoordinates)
		if (tooltipCoordinates) setTooltipRect(tooltipCoordinates)
		setOpen(newOpen)

		setTop(childrenCoordinates.y - tooltipCoordinates.height)
		setLeft(
			childrenCoordinates.x +
				childrenCoordinates.width / 2 -
				tooltipCoordinates.width / 2,
		)
		if (tooltipRef.current) tooltipRef.current.style.visibility = 'visible'
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

	const root = document.getElementById('tooltip')
	if (tooltipRef.current) {
		root?.appendChild(tooltipRef.current)
	}
	if (tooltipRef.current && (!open || !childRef)) {
		root?.removeChild(tooltipRef.current)
		tooltipRef.current.style.visibility = 'hidden'
	}

	if (open || tooltipRef.current) {
		return (
			<>
				<div
					className={classNames(
						css.tooltip,
						showAboveModal && css.showAboveModal,
					)}
					style={{
						top: top,
						left: left,
						visibility: 'hidden',
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
