'use client'
import { Flex, Tabs, Text, rem } from '@mantine/core'
import { IconPhoto, IconVideo, IconTypography } from '@tabler/icons-react'
import TextPanel from './components/TextPanel'
import classes from './index.module.css'
import Canvas from './components/Canvas'
import Timeline from './components/Timeline'
import ImagePanel from './components/ImagePanel'
import { useEffect } from 'react'
import useCanvasStore from '../store/canvas'
import '../utils/extended_objects'
import VideoPanel from './components/VideoPanel'

export default function Editor() {
	const iconStyle = { width: rem(20), height: rem(20) }
	const { setActiveElement, setActiveElementCanvas } = useCanvasStore(
		(store) => store
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

	return (
		<div className="flex justify-between w-full h-full min-h-screen py-8 px-4">
			<div className="flex justify-between max-w-[30%] w-full">
				<Tabs
					orientation="vertical"
					defaultValue="text"
					w="100%"
					px="sm"
					classNames={{ tab: classes.tab }}
				>
					<Tabs.List w="100">
						<Tabs.Tab value="text" w="100%">
							<Flex
								direction="column"
								align="center"
								justify={'center'}
								w="100%"
							>
								<IconTypography style={iconStyle} />
								<Text>Text</Text>
							</Flex>
						</Tabs.Tab>
						<Tabs.Tab value="image">
							<Flex direction="column" align="center" justify={'center'}>
								<IconPhoto style={iconStyle} />
								<Text>Image</Text>
							</Flex>
						</Tabs.Tab>
						<Tabs.Tab value="video">
							<Flex direction="column" align="center" justify={'center'}>
								<IconVideo style={iconStyle} />
								<Text>Video</Text>
							</Flex>
						</Tabs.Tab>
					</Tabs.List>

					<Tabs.Panel value="text" w="100%">
						<TextPanel />
					</Tabs.Panel>

					<Tabs.Panel value="image" w="100%">
						<ImagePanel />
					</Tabs.Panel>

					<Tabs.Panel value="video" w="100%">
						<VideoPanel />
					</Tabs.Panel>
				</Tabs>
			</div>
			<div className="flex justify-between flex-col w-full">
				<div className="flex justify-center">
					<Canvas />
				</div>
				<div>
					<Timeline />
				</div>
			</div>
		</div>
	)
}
