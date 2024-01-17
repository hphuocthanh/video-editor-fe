import useCanvasStore from '@/app/store/canvas'
import { Flex, FileInput } from '@mantine/core'
import Image from 'next/image'
import ImageCard from './ImageCard'

const ImagePanel = () => {
	const {addImage, images} = useCanvasStore((store) => store)

	const handleFileChange = (file: File | null) => {
		if (!file) return
		addImage(URL.createObjectURL(file))
	}

	return (
		<Flex direction="column" w="100%" gap="lg">
			<FileInput
				accept="image/png,image/jpeg"
				label="Upload files"
				placeholder="Upload files"
				onChange={handleFileChange}
			/>

			<Flex gap="sm" wrap={'nowrap'}>
				<Image height="100" width="100" alt="dumm1" src={'/img/dummy1.jpg'} />
        {images.map((image, index) => {
        return <ImageCard key={image} image={image} index={index} />;
      })}
			</Flex>
		</Flex>
	)
}
export default ImagePanel
