'use client'

import useCanvasStore from '@/app/store/canvas'
import { formatTimeToMinSecMili } from '@/app/utils'
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { useEffect } from 'react'

export type Props = {}
export const SeekPlayer = (_props: Props) => {
	const { playing, maxTime, getCurrentTimeframe, setPlaying, handleSeek } =
		useCanvasStore((store) => store)
	const Icon = playing ? IconPlayerPause : IconPlayerPlay
	const formattedTime = formatTimeToMinSecMili(getCurrentTimeframe())
	const formattedMaxTime = formatTimeToMinSecMili(maxTime)

	useEffect(() => {
		console.log('playing', playing)
	}, [playing])
  
	return (
		<div className="seek-player flex flex-col">
			<div className="flex flex-row items-center px-2">
				<button
					className="w-[80px] rounded  px-2 py-2"
					onClick={() => {
						setPlaying(!playing)
					}}
				>
					<Icon size="40"></Icon>
				</button>
				<span className="font-mono">{formattedTime}</span>
				<div className="w-[1px] h-[25px] bg-slate-300 mx-[10px]"></div>
				<span className="font-mono">{formattedMaxTime}</span>
			</div>
			<input
				className="flex-1"
				type="range"
				min={0}
				max={maxTime}
				value={getCurrentTimeframe()}
				onChange={(event) => {
					handleSeek(parseInt(event.target.value))
				}}
			/>
		</div>
	)
}
