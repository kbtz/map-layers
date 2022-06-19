import 'topojson-client'
declare module 'topojson-specification' {
	export type TopoGeometries<K extends string = string> = Topology<{ [P in K]: GeometryCollection }>
}

declare module 'd3-selection' {
	export type AnySelection = Selection<BaseType, unknown, BaseType, unknown>
}