'use client'
import React from 'react'

import DragableView from './DraggableView'
import { EditorElement } from '@/app/interfaces'
import useCanvasStore from '@/app/store/canvas'

export const TimeFrameView = (props: { element: EditorElement }) => {
	const { element } = props
	const {
		activeElement,
		setActiveElement,
		maxTime,
		updateEditorElementTimeFrame,
	} = useCanvasStore((store) => store)

	const disabled = element.type === 'audio'
	const isSelected = activeElement?.id === element.id
	const bgColorOnSelected = isSelected ? 'bg-slate-800' : 'bg-slate-600'
	const disabledCursor = disabled ? 'cursor-no-drop' : 'cursor-ew-resize'

	return (
		<div
			onClick={() => {
				setActiveElement(element)
			}}
			key={element.id}
			className={`relative width-full h-[25px] my-2 ${
				isSelected ? 'border-2 border-indigo-600 bg-slate-200' : ''
			}`}
		>
			<DragableView
				className="z-10"
				value={element.timeFrame.start}
				total={maxTime}
				disabled={disabled}
				onChange={(value) => {
					updateEditorElementTimeFrame(element, {
						start: value,
					})
				}}
			>
				<div
					className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
				></div>
			</DragableView>

			<DragableView
				className={disabled ? 'cursor-no-drop' : 'cursor-col-resize'}
				value={element.timeFrame.start}
				disabled={disabled}
				style={{
					width: `${
						((element.timeFrame.end - element.timeFrame.start) / maxTime) * 100
					}%`,
				}}
				total={maxTime}
				onChange={(value) => {
					const { start, end } = element.timeFrame
					updateEditorElementTimeFrame(element, {
						start: value,
						end: value + (end - start),
					})
				}}
			>
				<div
					className={`${bgColorOnSelected} h-full w-full text-white text-xs min-w-[0px] px-2 leading-[25px]`}
				>
					{element.name}
				</div>
			</DragableView>
			<DragableView
				className="z-10"
				disabled={disabled}
				value={element.timeFrame.end}
				total={maxTime}
				onChange={(value) => {
					updateEditorElementTimeFrame(element, {
						end: value,
					})
				}}
			>
				<div
					className={`bg-white border-2 border-blue-400 w-[10px] h-[10px] mt-[calc(25px/2)] translate-y-[-50%] transform translate-x-[-50%] ${disabledCursor}`}
				></div>
			</DragableView>
		</div>
	)
}
