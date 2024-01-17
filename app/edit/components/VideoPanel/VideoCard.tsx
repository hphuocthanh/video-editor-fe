'use client'
import useCanvasStore from '@/app/store/canvas'
import { UnstyledButton } from '@mantine/core'
import { useCallback, useRef } from 'react'

const VideoCard = ({ video, index }: { video: string; index: number }) => {
	const ref = useRef<HTMLVideoElement>(null)
	const { addVideoElement, refreshElements } = useCanvasStore((store) => store)

	const handleAddImage = useCallback(() => {
		addVideoElement(ref?.current, index)
		refreshElements()
	}, [addVideoElement, refreshElements, index])

	return (
		<UnstyledButton onClick={handleAddImage}>
			<video
				ref={ref}
				className="max-h-[100px] max-w-[150px]"
				src={video}
				id={`video-${index}`}
			></video>
		</UnstyledButton>
	)
}
export default VideoCard
