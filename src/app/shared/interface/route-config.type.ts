export interface RouteConfigInterface {
    title: string
    tag: string
    color: string
    oppositeColor: string
    path: PathInterface[]
    stop: StopInterface[]
    direction: DirectionInterface[]
}

export interface PathInterface {
    point: PointInterface[]
}

export interface PointInterface {
    lon: string
    lat: string
}

export interface StopInterface {
    tag: string
    title: string
    lon: string
    lat: string
    stopId: string
}

export interface DirectionInterface {
    tag: string
    title: string
    name: string
    stop: StopDirectionInterface[]
}

export interface StopDirectionInterface {
    tag: string
}
