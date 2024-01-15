import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { fabric } from 'fabric'
import { EditorElement, Placement, TextElement } from '../interfaces'
import { getUID } from '../utils'
import { produce } from 'immer'

interface CanvasState {
	canvas: fabric.Canvas | null
	setCanvas: (option: fabric.Canvas) => void
	texts: TextElement[]
	videos: string[]
	images: string[]
	addText: (text: TextElement) => void
	addImage: (image: string) => void
	addVideo: (vid: string) => void
	elements: EditorElement[]
	setElements: (els: EditorElement) => void
	maxTime: number
	refreshElements: () => void
	activeElement: EditorElement | null
	setActiveElement: (elm: EditorElement | null) => void
	setActiveElementCanvas: (elm: EditorElement | null) => void
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
			console.log('get called multiple times')
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
		addVideo: (item) => set((state) => ({ videos: [...state.videos, item] })),
		elements: [],
		setElements: (item) =>
			set((state) => ({
				elements: state.elements.map((elm) =>
					elm.id === item.id ? item : elm
				),
			})),
		refreshElements: () => {
			const state = get()
			console.log('refreshed get called multiple times')
			if (!state.canvas) return
			const canvas = state.canvas
			canvas.remove(...canvas.getObjects())
			for (let index = 0; index < state.elements.length; index++) {
				const element = state.elements[index]
				switch (element.type) {
					case 'video': {
						console.log('elementid', element.properties.elementId)
						if (document.getElementById(element.properties.elementId) == null)
							continue
						const videoElement = document.getElementById(
							element.properties.elementId
						) as HTMLVideoElement | null
						// if (!isHtmlVideoElement(videoElement)) continue
						if (!videoElement) continue
						const videoObject = new fabric.Image(videoElement, {
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
						if (document.getElementById(element.properties.elementId) == null)
							continue
						const imageElement = document.getElementById(
							element.properties.elementId
						) as HTMLImageElement | null
						// if (!isHtmlImageElement(imageElement)) continue
						// const filters = [];
						// if (element.properties.effect?.type === "blackAndWhite") {
						//   filters.push(new fabric.Image.filters.Grayscale());
						// }
						if (!imageElement) continue
						const imageObject = new fabric.Image(imageElement, {
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
							fill: '#ffffff',
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
			console.log('canvas', canvas)
			canvas.renderAll()
		},
	}))
)

export default useCanvasStore
