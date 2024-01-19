import useCanvasStore from '@/app/store/canvas'
import { Button, Flex } from '@mantine/core'

const ExportVideo = () => {
	const { saveVideo, handleSeek, setActiveElement, setPlaying } =
		useCanvasStore((store) => store)

	const handleExport = () => {
		handleSeek(0)
		setActiveElement(null)
		setTimeout(() => {
			setPlaying(true)
			saveVideo()
		}, 1000)
	}
	return (
		<Flex direction="column">
			<Button onClick={handleExport}>Export video</Button>
		</Flex>
	)
}
export default ExportVideo
