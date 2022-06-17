declare module 'd3-geo-projection' {
	import { GeoProjection, GeoPermissibleObjects } from 'd3-geo'
	export function geoPatterson(): GeoProjection
}

type MapLayers = 'countries' | 'regions' | 'states' | 'world'
type MapData = import('topojson-specification').TopoGeometries<MapLayers>
type Datum = GeoPermissibleObjects