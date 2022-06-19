declare module 'd3-geo-projection' {
	import { GeoProjection, GeoPermissibleObjects } from 'd3-geo'
	export function geoPatterson(): GeoProjection
}

type LayerType = 'country' | 'region' | 'state' | 'world'
type MapData = import('topojson-specification').TopoGeometries<LayerType>

type BaseType = import('d3-selection').BaseType
type Datum = import('d3-geo').ExtendedFeature<any, {
	type: LayerType
	name: string
	[k: string]: string
}>