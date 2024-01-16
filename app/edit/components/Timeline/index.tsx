'use client'
import React, { useEffect } from 'react'
import { TimeFrameView } from './TimeFrameView'
import useCanvasStore from '@/app/store/canvas'
import { SeekPlayer } from './SeekPlayer'

const Timeline = () => {
	const { getCurrentTimeframe, maxTime, elements } = useCanvasStore(
		(store) => store
	)
	const percentOfCurrentTime = (getCurrentTimeframe() / maxTime) * 100

	useEffect(() => {
		console.log('getCurrentTimeframe(', getCurrentTimeframe())
	}, [getCurrentTimeframe])

	return (
		<>
			<SeekPlayer />
			<div className="relative height-auto">
				<div
					className="w-[2px] bg-red-400 absolute top-0 bottom-0 z-20"
					style={{
						left: `${percentOfCurrentTime}%`,
					}}
				></div>
				{elements.map((element) => {
					return <TimeFrameView key={element.id} element={element} />
				})}
			</div>
		</>
	)
}

export default Timeline
