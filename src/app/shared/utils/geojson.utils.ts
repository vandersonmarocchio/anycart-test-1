import { PathInterface } from "../interface/route-config.type"

export namespace GeoJsonUtils {
    export function transformPathToGeoJSON(path: PathInterface) {
        let geoJsonModel = {
            type: 'FeatureCollection',
            features: []
        }
        for (let index = 0; index < path.point.length; index++) {
            let coordinate: any = {
                type: 'Feature',
                properties: { STREETNAME: null, LAYER: null, CNN: null },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [0, 0, 0.0],
                        [0, 0, 0.0]
                    ]
                }
            }
            if (path.point.length > index + 1) {
                coordinate.geometry.coordinates[0] = [path.point[index].lon, path.point[index].lat, 0, 0]
                coordinate.geometry.coordinates[1] = [path.point[index + 1].lon, path.point[index + 1].lat, 0, 0]
            } else {
                coordinate.geometry.coordinates[0] = [path.point[index].lon, path.point[index].lat, 0, 0]
                coordinate.geometry.coordinates[1] = [path.point[index].lon, path.point[index].lat, 0, 0]
            }
            geoJsonModel.features.push(coordinate)
        }
        return geoJsonModel
    }
}
