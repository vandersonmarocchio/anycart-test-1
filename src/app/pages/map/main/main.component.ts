import { Component, OnInit } from '@angular/core'
import * as d3 from 'd3'
import { RouteConfigInterface } from 'src/app/shared/interface/route-config.type'
import { JsonService } from 'src/app/shared/services/json.service'
import { NextBusService } from 'src/app/shared/services/next-bus.service'
import { XmlUtils } from 'src/app/shared/utils/xml.utils'
import { GeoJsonUtils } from 'src/app/shared/utils/geojson.utils'
import { ActivatedRoute } from '@angular/router'
import { LocalStorageUtils } from 'src/app/shared/utils/local-storage.utils'
import * as moment from 'moment'

@Component({
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    public dataList: any

    public routeLoaded: RouteConfigInterface[] = []
    public routeList: any[] = []
    public routeListSelected: string[] = []
    public map
    public svg
    public width: number = 720
    public height: number = 720
    public interval: any = null

    public typeList: any[] = [
        {
            view: 'Streets',
            value: 'streets'
        },
        {
            view: 'Freeways',
            value: 'freeways'
        },
        {
            view: 'Arteries',
            value: 'arteries'
        },
        {
            view: 'Neighborhoods',
            value: 'neighborhoods'
        }
    ]
    public typeSelected: string = 'streets'

    constructor(
        public jsonService: JsonService,
        public nextBusService: NextBusService,
        public actr: ActivatedRoute,
    ) {
        this.routeList = actr.snapshot.data.data
    }

    ngOnInit() {
        this.drawStreets()
    }

    onChangeType(value) {
        this.typeSelected = value
        this.dataList = null
        this.drawStreets()
    }

    onChangeRoute(value) {
        this.routeListSelected = value
        this.drawStreets()
    }

    async drawStreets() {

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on('zoom', ({ transform }) => { this.map.attr('transform', transform) })

        d3.select('body')
            .selectAll('svg')
            .remove()

        this.svg = d3
            .select('#map')
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .on('click', () => {
                this.svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity,
                    d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
                )
            })

        this.map = this.svg.append('g')

        if (!this.dataList) {
            this.dataList = await this.jsonService.getJson(`assets/data/${this.typeSelected}.json`).then(response => response)
        }

        const projectionMap = d3.geoMercator().fitExtent([[0, 0], [this.width, this.height]], this.dataList)
        const pathGenerator = d3.geoPath().projection(projectionMap)

        this.map.append('path')
            .datum(this.dataList)
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5')
            .on('click', e => clicked)

        this.routeLoaded = []
        if (this.routeListSelected.length > 0) {
            console.log(this.routeListSelected)
            const routeConfigOnCache: any[] = LocalStorageUtils.getItem('routeConfigList') || []
            for (let indexRoute = 0; indexRoute < this.routeListSelected.length; indexRoute++) {
                const routeName = this.routeListSelected[indexRoute]
                const routeFound = routeConfigOnCache.find(el => el.tag == routeName)
                if (routeFound !== undefined) {
                    this.routeLoaded.push(routeFound)
                    for (let index = 0; index < routeFound.path.length; index++) {
                        const path = routeFound.path[index]
                        const routeData: any = GeoJsonUtils.transformToGeoJSON(path)
                        this.map.append('path')
                            .datum(routeData)
                            .attr('d', pathGenerator)
                            .attr('fill', 'none')
                            .attr('stroke', routeFound.color)
                            .attr('stroke-width', '1')
                            .on('click', e => clicked)
                    }
                } else {
                    await this.nextBusService.routeConfig(routeName).then((resp) => {
                        const routeObject = XmlUtils.transformToRouteConfigInterface(resp)
                        routeConfigOnCache.push(routeObject)
                        this.routeLoaded.push(routeObject)
                        for (let index = 0; index < routeObject.path.length; index++) {
                            const path = routeObject.path[index]
                            const routeData: any = GeoJsonUtils.transformToGeoJSON(path)
                            this.map.append('path')
                                .datum(routeData)
                                .attr('d', pathGenerator)
                                .attr('fill', 'none')
                                .attr('stroke', routeObject.color)
                                .attr('stroke-width', '1')
                                .on('click', e => clicked)
                        }
                    })
                }
            }
            LocalStorageUtils.setItem('routeConfigList', routeConfigOnCache)
        }

        this.svg.call(zoom)

        function clicked(event, [x, y]) {
            event.stopPropagation()
            this.svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(40).translate(-x, -y),
            )
        }

        d3.select('#zoom_in')
            .on('click', () => zoom.scaleBy(this.svg.transition().duration(750), 1.2))

        d3.select('#zoom_out')
            .on('click', () => zoom.scaleBy(this.svg.transition().duration(750), 0.8))

        d3.select('#reset')
            .on('click', () => {
                this.svg.transition().duration(750).call(
                    zoom.transform,
                    d3.zoomIdentity,
                    d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
                )
            })
        this.loadVehicleLocations()
        clearInterval(this.interval)
        this.interval = setInterval(() => {
            this.loadVehicleLocations()
        }, 15000)
    }

    async loadVehicleLocations() {
        const projectionMap = d3.geoMercator().fitExtent([[0, 0], [this.width, this.height]], this.dataList)
        const pathGenerator = d3.geoPath().projection(projectionMap)
        for (const route of this.routeLoaded) {
            const time = moment().subtract('30', 'seconds').toDate().getTime().toString()
            console.log(route)
            await this.nextBusService.vehicleLocations(route.tag, time).then(async response => {
                console.log(route.tag, response.vehicle.length)
                if (response.vehicle != undefined) {
                    let coordinatesVehicleList = []
                    for (const point of response.vehicle) {
                        console.log([point.lon, point.lat])
                        coordinatesVehicleList = [...coordinatesVehicleList, [point.lon, point.lat]]
                        this.svg.selectAll('circle#' + route.title.replace(/[^a-zA-Z]+/g, '') + point.id).remove()
                        this.map.selectAll('path')
                            .data(coordinatesVehicleList)
                            .enter()
                            .append('circle')
                            .attr('d', pathGenerator)
                            .attr('id', route.title.replace(/[^a-zA-Z]+/g, '') + point.id)
                            .attr('cx', (d) => { console.log(projectionMap(d)[0]);return projectionMap(d)[0] })
                            .attr('cy', (d) => { return projectionMap(d)[1] })
                            .attr('r', '3px')
                            .attr('fill', '#ff0000')
                            .on('click', e => clicked)
                    }

                }
            })
        }

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on('zoom', ({ transform }) => { this.map.attr('transform', transform) })

        function clicked(event, [x, y]) {
            event.stopPropagation()
            this.svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(40).translate(-x, -y),
            )
        }
    }

    clear() {
        this.routeListSelected = []
        this.drawStreets()
    }
}
