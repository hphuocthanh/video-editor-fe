'use client'
import useCanvasStore from '@/app/store/canvas'
import { Image, UnstyledButton } from '@mantine/core'
import { useCallback, useRef } from 'react'

const ImageCard = ({ image, index }: { image: string; index: number }) => {
	const ref = useRef<HTMLImageElement>(null)
	const { addImageElement, refreshElements } = useCanvasStore((store) => store)

	const handleAddImage = useCallback(() => {
		addImageElement(ref?.current, index)
		refreshElements()
	}, [addImageElement, refreshElements, index])

	return (
		<UnstyledButton onClick={handleAddImage}>
			<Image
				ref={ref}
				className="max-h-[100px] max-w-[150px]"
				src={image}
				id={`image-${index}`}
				alt={`image-${index}`}
			></Image>
		</UnstyledButton>
	)
}
export default ImageCard
