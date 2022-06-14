import './style.css'

import d3 from './d3'
import { feature } from 'topojson-client'

const Features = (data: MapData) => (object: keyof MapData['objects']) =>
	feature(data, data.objects[object]).features

export const init = (selector: string, data: MapData) => {
	const
		features = Features(data),
		projection = d3.geoPatterson().rotate([-11, 0]),
		path = d3.geoPath(projection),
		zoom = d3.zoom<SVGSVGElement, any>().scaleExtent([1, 8]),
		host = d3.select<HTMLElement, any>(selector)!,
		svg = host.append('svg'),
		root = svg.append('g.root'),
		world = root.append('g.world')

	world.selectAll('path')
		.data(features('world'))
		.join('path')
		.attr('d', path)

	const
		resized = () => {
			const { width, height } = host.node()!.getBoundingClientRect()
			svg.attr('viewbox', `0 0 ${width} ${height}`)
		},
		zoomed = ({ transform }: any) => {
			root.attr('transform', transform)
			root.attr('stroke-width', 1 / transform.k)
		}


	window.onresize = resized
	zoom.on('zoom', zoomed)

	resized()
	svg.call(zoom)
}