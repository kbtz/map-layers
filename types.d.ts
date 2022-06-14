type Topology = import('topojson-specification').Topology
type GeometryCollection = import('topojson-specification').GeometryCollection

interface MapData extends Topology {
	objects: {
		countries: GeometryCollection
		regions: GeometryCollection
		states: GeometryCollection
		world: GeometryCollection
	}
}