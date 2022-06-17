import './style.css'
import d3 from './d3'

const
	zoom = d3.zoom().filter(() => false),
	projection = d3.geoPatterson().rotate([-11, 0]),
	path = d3.geoPath(projection),
	svg = d3.create('svg'),
	root = svg.append('g.root')

let host: HTMLElement

export default (hostEl: HTMLElement, data: MapData) => {
	const features = d3.features(data)

	host = hostEl
	host.appendChild(svg.node()!)

	root.append('g.world')
		.selectAll('path')
		.data(features.world)
		.join('path')
		.attr('d', path)

	root.append('g.regions')
		.selectAll('path')
		.data(features.regions)
		.join('path')
		.classed('region', true)
		.attr('data-label', d => d.properties!.region)
		.attr('d', path)
		.on('click', onClick)

	window.onresize = onResize
	zoom.on('zoom', onZoom)

	onResize()
	svg.call(zoom)
	setTimeout(() => {
		focus(features.world[0])
	}, 2000)
}

function onResize() {
	const { width, height } = host.getBoundingClientRect()
	svg.attr('viewbox', `0 0 ${width} ${height}`)
}

function onZoom({ transform }: any) {
	root.attr('transform', transform)
	//root.attr('stroke-width', 1.5 / transform.k)
}

function onClick(_: PointerEvent, datum: Datum) {
	focus(datum)
}

function focus(datum: Datum) {
	const
		{ width, height } = host.getBoundingClientRect(),
		[[x0, y0], [x1, y1]] = path.bounds(datum)

	svg
		.transition().duration(600)
		.call(
			zoom.transform,
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				//.scale(Math.max((x1 - x0) / W, (y1 - y0) / H))
				.scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
				.translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
		)
}
