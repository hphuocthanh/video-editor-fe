import { TextElement } from '@/app/interfaces'
import useCanvasStore from '@/app/store/canvas'
import { Button, Flex, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useCallback, useEffect } from 'react'

const TextPanel = () => {
	const addText = useCanvasStore((store) => store.addText)
	const refreshElements = useCanvasStore((store) => store.refreshElements)
	const setActiveElement = useCanvasStore((store) => store.setActiveElement)
	const setActiveElementCanvas = useCanvasStore(
		(store) => store.setActiveElementCanvas
	)

	useEffect(() => {
		useCanvasStore.subscribe(
			(store) => store.elements,
			(elements) => {
				setActiveElement(elements[elements.length - 1])
				setActiveElementCanvas(elements[elements.length - 1])
			}
		)
	}, [setActiveElement, setActiveElementCanvas])

	const handleAddText = useCallback(
		(text: TextElement) => {
			addText(text)
			refreshElements()
		},
		[addText, refreshElements]
	)

	return (
		<Flex direction="column" w="100%" gap="lg">
			<Button
				variant="subtle"
				leftSection={<IconPlus />}
				justify="start"
				size="lg"
				onClick={() =>
					handleAddText({
						text: 'Title',
						size: 32,
						weight: 700,
					})
				}
			>
				<Text size="xl" fw={700}>
					Title
				</Text>
			</Button>
			<Button
				variant="subtle"
				leftSection={<IconPlus />}
				justify="start"
				size="lg"
				onClick={() =>
					handleAddText({
						text: 'Subtitle',
						size: 24,
						weight: 500,
					})
				}
			>
				<Text size="md" fw={500}>
					Subtitle
				</Text>
			</Button>
			<Button
				variant="subtle"
				leftSection={<IconPlus />}
				justify="start"
				size="lg"
				onClick={() =>
					handleAddText({
						text: 'Body',
						size: 18,
						weight: 400,
					})
				}
			>
				<Text size="sm">Body</Text>
			</Button>
		</Flex>
	)
}
export default TextPanel
