'use client'
import { useEffect } from 'react'
import { fabric } from 'fabric'
import useCanvasStore from '@/app/store/canvas'

const Canvas = () => {
	const setCanvas = useCanvasStore((store) => store.setCanvas)
	const canvas = useCanvasStore((store) => store.canvas)
	const setActiveElement = useCanvasStore((store) => store.setActiveElement)
	useEffect(() => {
		if (canvas) return
		const _canvas = new fabric.Canvas('canvas', {
			width: 360,
			height: 640,
			backgroundColor: '#ededed',
		})
		fabric.Object.prototype.transparentCorners = false
		fabric.Object.prototype.cornerColor = '#00a0f5'
		fabric.Object.prototype.cornerStyle = 'circle'
		fabric.Object.prototype.cornerStrokeColor = '#0063d8'
		fabric.Object.prototype.cornerSize = 10
		// canvas mouse down without target should deselect active object
		_canvas.on('mouse:down', function (e) {
			if (!e.target) {
				setActiveElement(null)
			}
		})

		setCanvas(_canvas)
		fabric.util.requestAnimFrame(function render() {
			_canvas.renderAll()
			fabric.util.requestAnimFrame(render)
		})
	}, [setCanvas, canvas, setActiveElement])

	return <canvas id="canvas" className="w-[360px] h-[640px]" />
}
export default Canvas
