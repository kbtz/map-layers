import { BaseType, Selection, selection, select } from 'd3-selection'
import { geoPath } from 'd3-geo'
import { geoPatterson } from 'd3-geo-projection'
import { zoom } from 'd3-zoom'

const d3Append = selection.prototype.append as Function

selection.prototype.append = function (type: string) {
	const
		id = type.match(/\#[-\w]+/),
		tag = type.replace(/[^\w].*/, ''),
		classes = Array.from(type.matchAll(/\.[-\w]+/g), m => m[0]),
		sel = d3Append.call(this, tag) as Selection<BaseType, unknown, BaseType, any>

	if (id) sel.attr('id', id[0].slice(1))
	sel.attr('class', classes.join(' ').replaceAll('.', ''))

	return sel
}

export default {
	select, zoom,
	geoPath, geoPatterson
}