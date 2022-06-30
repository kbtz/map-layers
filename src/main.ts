import './style.scss'
import d3 from './d3'

let
	host: HTMLElement,
	features: Record<LayerType, Datum[]>, selection: Datum[] = [],
	country: Datum[], state: Datum[]

const
	zoom = d3.zoom(),
	projection = d3.geoPatterson().rotate([-11, 0]),
	path = d3.geoPath(projection),
	svg = d3.create('svg'),
	root = svg.append('g.root'),
	viewbox = () => {
		const { width, height } = host.getBoundingClientRect()
		svg.attr('viewbox', `0 0 ${width} ${height}`)
	}


export default (hostEl: HTMLElement, data: MapData) => {
	features = d3.features(data)

	host = hostEl
	host.appendChild(svg.node()!)
	host.onclick = deselect

	root.append('g.world')
		.selectAll('path')
		.data(features.world)
		.join('path')
		.attr('d', path)

	root.append('g.region')
		.selectAll('path')
		.data(features.region)
		.join('path')
		.attr('d', path)
		.on('click', onClick)

	country = features.country
	state = features.state

	window.onresize = () => {
		viewbox()
		focus(selection[0])
	}

	viewbox()

	zoom.on('zoom', onZoom)
	svg.call(zoom)

	select(features.world[0])
	setTimeout(() => {
		projection.rotate([-30, 0])
	}, 2000)
}

function onZoom({ transform }: any) {
	root.attr('transform', transform)
	root.attr('stroke-width', 2 / transform.k)
}

function onClick(event: PointerEvent, datum: Datum) {
	event.stopPropagation()
	select(datum)
}

function select(datum: Datum) {
	const { type, name } = datum.properties
	if (type == 'state') return

	children(type, datum)
	selection.unshift(datum)

	root.attr('class', 'root ' + type)
	document.title = name
	focus(datum)

	root.selectAll('g.' + type + ' path')
		.filter(d => d == datum)
		.classed('selected', true)
}

function deselect() {
	const { type } = selection[0].properties
	if (type == 'world') return

	unchildren(type)

	const previous = selection[1]
	selection = selection.slice(2)

	root.select('path.selected')
		.classed('selected', false)

	select(previous)
}

function children(type: LayerType, datum: Datum) {
	if (type == 'world' || type == 'state') return

	const data = type == 'region'
		? country.filter(c => c.properties['region'] == datum.properties['name'])
		: state.filter(s => s.properties['code'] == datum.properties['code'])

	// TODO 1 "state" countries

	root.append('g')
		.classed(type == 'region' ? 'country' : 'state', true)
		.selectAll('path')
		.data(data)
		.join('path')
		.attr('d', path)
		.on('click', onClick)
}


function unchildren(type: LayerType) {
	if (type == 'region') root.select('g.country').remove()
	if (type == 'country') {
		root.select('g.country').remove()
		root.select('g.state').remove()
	}
}

function focus(datum: Datum) {
	const
		{ width, height } = host.getBoundingClientRect(),
		[[x0, y0], [x1, y1]] = path.bounds(datum)

	svg
		.transition()
		.duration(600)
		.call(
			zoom.transform,
			d3.zoomIdentity
				.translate(width / 2, height / 2)
				.scale(0.95 / Math.max((x1 - x0) / width, (y1 - y0) / height))
				.translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
		)
}