import { Geometry, Feature } from 'geojson'
declare module 'topojson-specification' {
	export type TopoGeometries<K extends string = string> = Topology<{ [P in K]: GeometryCollection }>
	export type Features = Array<Feature<Geometry>>
}

declare module 'd3-selection' {
	export type AnySelection = Selection<BaseType, unknown, BaseType, unknown>
}