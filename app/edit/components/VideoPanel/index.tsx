import useCanvasStore from '@/app/store/canvas'
import { Flex, FileInput } from '@mantine/core'
import VideoCard from './VideoCard'

const VideoPanel = () => {
	const { addImage, videos } = useCanvasStore((store) => store)

	const handleFileChange = (file: File | null) => {
		if (!file) return
		addImage(URL.createObjectURL(file))
	}

	return (
		<Flex direction="column" w="100%" gap="lg">
			<FileInput
				accept="video/mp4,video/*"
				label="Upload files"
				placeholder="Upload files"
				onChange={handleFileChange}
			/>

			<Flex gap="sm" wrap={'nowrap'}>
				{videos.map((vid, index) => {
					return <VideoCard key={vid} video={vid} index={index} />
				})}
			</Flex>
		</Flex>
	)
}
export default VideoPanel
