import { selection, select, create, AnySelection, } from 'd3-selection'
import { geoPatterson } from 'd3-geo-projection'
import { geoPath } from 'd3-geo'
import { zoom, zoomIdentity } from 'd3-zoom'

import { feature } from 'topojson-client'
import { TopoGeometries } from 'topojson-specification'

import 'd3-transition'

const append = selection.prototype.append
selection.prototype.append = function (type: string) {
	const
		id = type.match(/\#[-\w]+/),
		tag = type.replace(/[^\w].*/, ''),
		classes = Array.from(type.matchAll(/\.[-\w]+/g), m => m[0]),
		sel = append.call(this, tag) as AnySelection

	if (id) sel.attr('id', id[0].slice(1))
	sel.attr('class', classes.join(' ').replaceAll('.', ''))

	return sel
}

export default {
	select, create,
	geoPath, geoPatterson,
	zoom: () => zoom<SVGSVGElement, undefined>(), zoomIdentity,
	features: <T extends TopoGeometries, P extends object = Record<keyof T['objects'], Datum[]>>
		(data: T) => new Proxy({}, { get: (_, k: string) => feature(data, data.objects[k]).features }) as P
}
