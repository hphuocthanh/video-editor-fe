import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { fabric } from 'fabric'
import {
	EditorElement,
	Placement,
	TextElement,
	TimeFrame,
	VideoEditorElement,
} from '../interfaces'
import { getUID, isHtmlImageElement, isHtmlVideoElement } from '../utils'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'
import { VIDEO_DIM } from '../utils/constants'

interface CanvasState {
	canvas: fabric.Canvas | null
	setCanvas: (option: fabric.Canvas) => void
	texts: TextElement[]
	videos: string[]
	images: string[]
	addText: (text: TextElement) => void
	addImage: (image: string) => void
	addImageElement: (elm: HTMLImageElement | null, idx: number) => void
	addVideo: (vid: string) => void
	addVideoElement: (elm: HTMLVideoElement | null, idx: number) => void
	elements: EditorElement[]
	setElements: (els: EditorElement) => void
	maxTime: number
	refreshElements: () => void
	activeElement: EditorElement | null
	setActiveElement: (elm: EditorElement | null) => void
	setActiveElementCanvas: (elm: EditorElement | null) => void

	currentKeyFrame: number
	fps: number
	playing: boolean
	setPlaying: (isPlayed: boolean) => void
	startedTime: number
	startedTimePlay: number
	playFrames: () => void
	setStartedTime: (time: number) => void
	setStartedTimePlay: (time: number) => void
	getCurrentTimeframe: () => number
	setCurrentTimeInMs: (time: number) => void

	updateVideoElements: () => void
	updateAudioElements: () => void
	updateEditorElementTimeFrame: (
		editorElement: EditorElement,
		timeFrame: Partial<TimeFrame>
	) => void
	handleSeek: (seek: number) => void
	updateTimeTo: (newTime: number) => void

	saveVideo: () => void
}

const useCanvasStore = create<CanvasState>()(
	subscribeWithSelector((set, get) => ({
		canvas: null,
		setCanvas: (option) => set((state) => ({ canvas: option })),
		maxTime: 30 * 1000,
		activeElement: null,
		setActiveElement: (elm) => {
			return set(() => ({ activeElement: elm }))
		},
		setActiveElementCanvas: (elm) => {
			if (get()?.canvas) {
				const canvas = get().canvas
				if (elm?.fabricObject) canvas?.setActiveObject(elm.fabricObject)
				else canvas?.discardActiveObject()
			}
		},

		texts: [],
		videos: [],
		images: [],
		addText: (item) => {
			set((state) => {
				const id = getUID()
				const elm: EditorElement = {
					id,
					name: `Text ${id}`,
					type: 'text',
					placement: {
						x: 0,
						y: 0,
						width: 100,
						height: 100,
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
					},
					timeFrame: {
						start: 0,
						end: state.maxTime,
					},
					properties: {
						text: item.text,
						fontSize: item.size,
						fontWeight: item.weight,
						splittedTexts: [],
					},
				}
				return { elements: [...state.elements, elm] }
			})
		},
		addImage: (item) => set((state) => ({ images: [...state.images, item] })),
		addImageElement: (imageElement, index) =>
			set((state) => {
				if (!isHtmlImageElement(imageElement)) {
					return state
				}
				const aspectRatio =
					imageElement.naturalWidth / imageElement.naturalHeight
				const id = getUID()
				const element: EditorElement = {
					id,
					name: `Media(image) ${index + 1}`,
					type: 'image',
					placement: {
						x: 0,
						y: 0,
						width: 100 * aspectRatio,
						height: 100,
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
					},
					timeFrame: {
						start: 0,
						end: get().maxTime,
					},
					properties: {
						elementId: `image-${index}`,
						src: imageElement.src,
						effect: {
							type: 'none',
						},
					},
				}

				return { elements: [...state.elements, element] }
			}),
		addVideo: (item) => set((state) => ({ videos: [...state.videos, item] })),
		addVideoElement: (element, index) =>
			set((state) => {
				if (!isHtmlVideoElement(element)) {
					return state
				}
				const videoDurationMs = element.duration * 1000
				const aspectRatio = element.videoWidth / element.videoHeight
				const id = getUID()
				const newElm: EditorElement = {
					id,
					name: `Media(video) ${index + 1}`,
					type: 'video',
					placement: {
						x: 0,
						y: 0,
						width: 100 * aspectRatio,
						height: 100,
						rotation: 0,
						scaleX: 1,
						scaleY: 1,
					},
					timeFrame: {
						start: 0,
						end: videoDurationMs,
					},
					properties: {
						elementId: `video-${index}`,
						src: element.src,
						effect: {
							type: 'none',
						},
					},
				}

				return { elements: [...state.elements, newElm] }
			}),
		elements: [],
		setElements: (item) =>
			set((state) => ({
				elements: state.elements.map((elm) =>
					elm.id === item.id ? item : elm
				),
			})),
		refreshElements: () => {
			const state = get()

			if (!state.canvas) return
			const canvas = state.canvas
			canvas.remove(...canvas.getObjects())
			for (let index = 0; index < state.elements.length; index++) {
				const element = state.elements[index]

				switch (element.type) {
					case 'video': {
						if (document.getElementById(element.properties.elementId) == null)
							continue
						const videoElement = document.getElementById(
							element.properties.elementId
						) as HTMLVideoElement | null
						// if (!isHtmlVideoElement(videoElement)) continue
						if (!videoElement) continue
						const videoObject = new fabric.CoverVideo(videoElement, {
							name: element.id,
							left: element.placement.x,
							top: element.placement.y,
							width: element.placement.width,
							height: element.placement.height,
							scaleX: element.placement.scaleX,
							scaleY: element.placement.scaleY,
							angle: element.placement.rotation,
							objectCaching: false,
							selectable: true,
							lockUniScaling: true,
							// filters: filters,
							// @ts-ignore
							customFilter: element.properties.effect.type,
						})

						element.fabricObject = videoObject
						element.properties.imageObject = videoObject
						videoElement.width = 100
						videoElement.height =
							(videoElement.videoHeight * 100) / videoElement.videoWidth
						canvas.add(videoObject)
						canvas.on('object:modified', function (e) {
							if (!e.target) return
							const target = e.target
							if (target != videoObject) return
							const placement = element.placement
							const newPlacement: Placement = {
								...placement,
								x: target.left ?? placement.x,
								y: target.top ?? placement.y,
								rotation: target.angle ?? placement.rotation,
								width:
									target.width && target.scaleX
										? target.width * target.scaleX
										: placement.width,
								height:
									target.height && target.scaleY
										? target.height * target.scaleY
										: placement.height,
								scaleX: 1,
								scaleY: 1,
							}
							const newElement = {
								...element,
								placement: newPlacement,
							}
							state.setElements(newElement)
						})
						break
					}
					case 'image': {
						console.log(
							'element.properties.elementId',
							element.properties.elementId,
							document.getElementById(element.properties.elementId)
						)
						if (document.getElementById(element.properties.elementId) == null)
							continue
						const imageElement = document.getElementById(
							element.properties.elementId
						) as HTMLImageElement | null
						if (!isHtmlImageElement(imageElement)) continue

						const imageObject = new fabric.CoverImage(imageElement, {
							name: element.id,
							left: element.placement.x,
							top: element.placement.y,
							angle: element.placement.rotation,
							objectCaching: false,
							selectable: true,
							lockUniScaling: true,
							// filters
							// @ts-ignore
							customFilter: element.properties.effect.type,
						})
						// imageObject.applyFilters();
						element.fabricObject = imageObject
						element.properties.imageObject = imageObject
						const image = {
							w: imageElement.naturalWidth,
							h: imageElement.naturalHeight,
						}

						imageObject.width = image.w
						imageObject.height = image.h
						imageElement.width = image.w
						imageElement.height = image.h
						imageObject.scaleToHeight(image.w)
						imageObject.scaleToWidth(image.h)
						const toScale = {
							x: element.placement.width / image.w,
							y: element.placement.height / image.h,
						}
						imageObject.scaleX = toScale.x * element.placement.scaleX
						imageObject.scaleY = toScale.y * element.placement.scaleY
						canvas.add(imageObject)
						canvas.on('object:modified', function (e) {
							if (!e.target) return
							const target = e.target
							if (target != imageObject) return
							const placement = element.placement
							let fianlScale = 1
							if (target.scaleX && target.scaleX > 0) {
								fianlScale = target.scaleX / toScale.x
							}
							const newPlacement: Placement = {
								...placement,
								x: target.left ?? placement.x,
								y: target.top ?? placement.y,
								rotation: target.angle ?? placement.rotation,
								scaleX: fianlScale,
								scaleY: fianlScale,
							}
							const newElement = {
								...element,
								placement: newPlacement,
							}
							state.setElements(newElement)
						})
						break
					}
					case 'audio': {
						break
					}
					case 'text': {
						const textObject = new fabric.Textbox(element.properties.text, {
							name: element.id,
							left: element.placement.x,
							top: element.placement.y,
							scaleX: element.placement.scaleX,
							scaleY: element.placement.scaleY,
							width: element.placement.width,
							height: element.placement.height,
							angle: element.placement.rotation,
							fontSize: element.properties.fontSize,
							fontWeight: element.properties.fontWeight,
							objectCaching: false,
							selectable: true,
							lockUniScaling: true,
							fill: '#000000',
						})
						element.fabricObject = textObject
						canvas.add(textObject)
						canvas.on('object:modified', function (e) {
							if (!e.target) return
							const target = e.target
							if (target != textObject) return
							const placement = element.placement
							const newPlacement: Placement = {
								...placement,
								x: target.left ?? placement.x,
								y: target.top ?? placement.y,
								rotation: target.angle ?? placement.rotation,
								width: target.width ?? placement.width,
								height: target.height ?? placement.height,
								scaleX: target.scaleX ?? placement.scaleX,
								scaleY: target.scaleY ?? placement.scaleY,
							}
							const newElement = {
								...element,
								placement: newPlacement,
								properties: {
									...element.properties,
									// @ts-ignore
									text: target?.text,
								},
							}
							state.setElements(newElement)
						})
						break
					}
					default: {
						throw new Error('Not implemented')
					}
				}
				if (element.fabricObject) {
					element.fabricObject.on('selected', function (e) {
						state.setActiveElement(element)
						state.setActiveElementCanvas(element)
					})
				}
			}
			const selectedEditorElement = state.activeElement
			if (selectedEditorElement && selectedEditorElement.fabricObject) {
				canvas.setActiveObject(selectedEditorElement.fabricObject)
			}
			// refreshAnimations()
			// updateTimeTo(this.currentTimeInMs)
			canvas.renderAll()
		},
		updateVideoElements: () => {
			const editorElements = get().elements
			editorElements
				.filter(
					(element): element is VideoEditorElement => element.type === 'video'
				)
				.forEach((element) => {
					const video = document.getElementById(element.properties.elementId)
					if (isHtmlVideoElement(video)) {
						const videoTime =
							(get().getCurrentTimeframe() - element.timeFrame.start) / 1000
						video.currentTime = videoTime
						if (get().playing) {
							video.play()
						} else {
							video.pause()
						}
					}
				})
		},
		updateAudioElements: () => {},
		currentKeyFrame: 0,
		fps: 60,
		playing: false,
		startedTime: 0,
		startedTimePlay: 0,
		setPlaying: (isPlayed) => {
			set(() => ({ playing: isPlayed }))
			get().updateVideoElements()
			get().updateAudioElements()
			if (isPlayed) {
				get().setStartedTime(Date.now())
				get().setStartedTimePlay(get().getCurrentTimeframe())
				requestAnimationFrame(() => {
					get().playFrames()
				})
			}
		},
		setStartedTime: (time) => set(() => ({ startedTime: time })),
		setStartedTimePlay: (time) => set(() => ({ startedTimePlay: time })),
		playFrames: () => {
			if (!get().playing) {
				return
			}
			const elapsedTime = Date.now() - get().startedTime
			const newTime = get().startedTimePlay + elapsedTime
			get().updateTimeTo(newTime)
			if (newTime > get().maxTime) {
				get().setCurrentTimeInMs(0)
				get().setPlaying(false)
			} else {
				requestAnimationFrame(() => {
					get().playFrames()
				})
			}
		},
		getCurrentTimeframe: () => {
			return (get().currentKeyFrame * 1000) / get().fps
		},
		setCurrentTimeInMs: (time: number) =>
			set((state) => ({
				currentKeyFrame: Math.floor((time / 1000) * state.fps),
			})),
		updateEditorElementTimeFrame: (
			editorElement: EditorElement,
			timeFrame: Partial<TimeFrame>
		) => {
			if (timeFrame.start != undefined && timeFrame.start < 0) {
				timeFrame.start = 0
			}
			if (timeFrame.end != undefined && timeFrame.end > get().maxTime) {
				timeFrame.end = get().maxTime
			}
			const newEditorElement = {
				...editorElement,
				timeFrame: {
					...editorElement.timeFrame,
					...timeFrame,
				},
			}
			get().updateVideoElements()
			get().updateAudioElements()
			get().setElements(newEditorElement)
		},
		updateTimeTo: (newTime: number) => {
			get().setCurrentTimeInMs(newTime)
			get().elements.forEach((e) => {
				if (!e.fabricObject) return
				const isInside =
					e.timeFrame.start <= newTime && newTime <= e.timeFrame.end
				e.fabricObject.visible = isInside
			})
		},
		handleSeek: (seek: number) => {
			if (get().playing) {
				get().setPlaying(false)
			}
			get().updateTimeTo(seek)
			get().updateVideoElements()
			get().updateAudioElements()
		},

		saveVideo: () => {
			const canvas = document.getElementById('canvas') as HTMLCanvasElement
			const stream = canvas.captureStream(30)
			const audioElements = get().elements.filter((e) => e.type === 'audio')
			const audioStreams: MediaStream[] = []
			audioElements.forEach((audio) => {
				const audioElement = document.getElementById(
					audio.properties.elementId
				) as HTMLAudioElement
				let ctx = new AudioContext()
				let sourceNode = ctx.createMediaElementSource(audioElement)
				let dest = ctx.createMediaStreamDestination()
				sourceNode.connect(dest)
				sourceNode.connect(ctx.destination)
				audioStreams.push(dest.stream)
			})
			audioStreams.forEach((audioStream) => {
				stream.addTrack(audioStream.getAudioTracks()[0])
			})
			const video = document.createElement('video')
			video.srcObject = stream
			video.height = VIDEO_DIM.HEIGHT
			video.width = VIDEO_DIM.WIDTH
			// video.controls = true;
			// document.body.appendChild(video);
			video.play().then(() => {
				const mediaRecorder = new MediaRecorder(stream)
				const chunks: Blob[] = []
				mediaRecorder.ondataavailable = function (e) {
					chunks.push(e.data)
					console.log('data available')
				}
				mediaRecorder.onstop = async function (e) {
					const blob = new Blob(chunks, { type: 'video/webm' })

					// lets use ffmpeg to convert webm to mp4
					const data = new Uint8Array(await blob.arrayBuffer())
					const ffmpeg = new FFmpeg()
					const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
					await ffmpeg.load({
						coreURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.js`,
							'text/javascript'
						),
						wasmURL: await toBlobURL(
							`${baseURL}/ffmpeg-core.wasm`,
							'application/wasm'
						),
						// workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
					})
					await ffmpeg.writeFile('video.webm', data)
					await ffmpeg.exec([
						'-y',
						'-i',
						'video.webm',
						'-c',
						'copy',
						'video.mp4',
					])
					// await ffmpeg.exec(["-y", "-i", "video.webm", "-c:v", "libx264", "video.mp4"]);

					const output = await ffmpeg.readFile('video.mp4')
					const outputBlob = new Blob([output], { type: 'video/mp4' })
					const outputUrl = URL.createObjectURL(outputBlob)
					const a = document.createElement('a')
					a.download = 'video.mp4'
					a.href = outputUrl
					a.click()
				}

				mediaRecorder.start()
				setTimeout(() => {
					mediaRecorder.stop()
				}, get().maxTime)
				video.remove()
			})
		},
	}))
)

export default useCanvasStore
