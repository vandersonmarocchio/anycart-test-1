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
    public svg: any
    public map: any
    public projectionMap: any
    public geoPath: any
    public width: number = 720
    public height: number = 720
    public dataList: any
    public routeLoaded: RouteConfigInterface[] = []
    public routeList: any[] = []
    public routeListSelected: string[] = []

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
        this.drawMap()
    }

    onChangeType(value) {
        this.typeSelected = value
        this.dataList = null
        this.drawMap()
    }

    onChangeRoute(value) {
        this.routeListSelected = value
        this.drawMap()
    }

    async drawMap() {
        const zoom = d3
            .zoom()
            .scaleExtent([1, 40])
            .on('zoom', ({ transform }) => { this.map.attr('transform', transform) })

        d3.selectAll('svg#sf-map')
            .remove()

        this.svg = d3
            .select('#map')
            .append('svg')
            .attr('id', 'sf-map')
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

        this.projectionMap = d3.geoMercator().fitExtent([[0, 0], [this.width, this.height]], this.dataList)
        this.geoPath = d3.geoPath().projection(this.projectionMap)

        this.map.append('path')
            .datum(this.dataList)
            .attr('d', this.geoPath)
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5')
            .on('click', e => clicked)

        this.routeLoaded = []
        if (this.routeListSelected.length > 0) {
            console.log(this.routeListSelected)
            const routeConfigOnCache: any[] = LocalStorageUtils.getItem('routeConfigList') || []
            for (let indexRoute = 0; indexRoute < this.routeListSelected.length; indexRoute++) {
                const routeFound = routeConfigOnCache.find(el => el.tag == this.routeListSelected[indexRoute])
                if (routeFound !== undefined) {
                    console.log(routeFound)
                    this.routeLoaded.push(routeFound)
                    for (let index = 0; index < routeFound.path.length; index++) {
                        const routeData: any = GeoJsonUtils.transformPathToGeoJSON(routeFound.path[index])
                        this.map.append('path')
                            .datum(routeData)
                            .attr('d', this.geoPath)
                            .attr('fill', 'none')
                            .attr('stroke', routeFound.color)
                            .attr('stroke-width', '1')
                            .on('click', e => clicked)
                    }
                    for (let index = 0; index < routeFound.stop.length; index++) {
                        this.map
                            .append('circle')
                            .attr('id', 'stop' + routeFound.title.replace(/[^a-zA-Z]+/g, '') + routeFound.stop[index].stopId)
                            .attr('cx', this.projectionMap([routeFound.stop[index].lon, routeFound.stop[index].lat])[0])
                            .attr('cy', this.projectionMap([routeFound.stop[index].lon, routeFound.stop[index].lat])[1])
                            .attr('r', '1px')
                            .attr('fill', '#fff')
                            .on('click', e => clicked)
                    }
                } else {
                    await this.nextBusService.routeConfig(this.routeListSelected[indexRoute]).then((resp) => {
                        const routeObject = XmlUtils.transformToRouteConfigInterface(resp)
                        routeConfigOnCache.push(routeObject)
                        this.routeLoaded.push(routeObject)
                        for (let index = 0; index < routeObject.path.length; index++) {
                            const path = routeObject.path[index]
                            const routeData: any = GeoJsonUtils.transformPathToGeoJSON(path)
                            this.map.append('path')
                                .datum(routeData)
                                .attr('d', this.geoPath)
                                .attr('fill', 'none')
                                .attr('stroke', routeObject.color)
                                .attr('stroke-width', '1')
                                .on('click', e => clicked)

                        }
                        for (let index = 0; index < routeObject.stop.length; index++) {
                            console.log(routeObject.stop[index])
                            this.map
                                .append('circle')
                                .attr('id', 'stop' + routeObject.title.replace(/[^a-zA-Z]+/g, '') + routeObject.stop[index].stopId)
                                .attr('cx', this.projectionMap([routeObject.stop[index].lon, routeObject.stop[index].lat])[0])
                                .attr('cy', this.projectionMap([routeObject.stop[index].lon, routeObject.stop[index].lat])[1])
                                .attr('r', '1px')
                                .attr('fill', routeObject.color)
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
        d3.selectAll('circle').nodes().map((e: any) => e.id.includes('position') ? d3.selectAll("circle#" + e.id).remove() : '')
        d3.selectAll("div").nodes().map((e: any) => e.id.includes('tooltip') ? d3.selectAll("div#" + e.id).remove() : '')

        for (const route of this.routeLoaded) {
            const time = moment().subtract('30', 'seconds').toDate().getTime().toString()
            await this.nextBusService.vehicleLocations(route.tag, time).then(async response => {
                if (response.vehicle != undefined && response.vehicle.length > 0) {
                    for (const point of response.vehicle) {
                        let div = d3.select("body")
                            .append("div")
                            .attr('id', "tooltip" + route.title.replace(/[^a-zA-Z]+/g, '') + point.id)
                            .style("visibility", "hidden")
                            .style('background-color', route.color)
                            .style('color', route.oppositeColor)

                        this.map
                            .append('circle')
                            .attr('id', 'position' + route.title.replace(/[^a-zA-Z]+/g, '') + point.id)
                            .attr('cx', this.projectionMap([point.lon, point.lat])[0])
                            .attr('cy', this.projectionMap([point.lon, point.lat])[1])
                            .attr('r', '3px')
                            .attr('fill', '#000')
                            .on('click', e => clicked)
                            .on("mouseover", (d) => {
                                div.transition()
                                    .duration(200)
                                    .style("visibility", "visible")
                                div.html(`Route: ${point.routeTag} <br/>Id: ${point.id} <br/>Speed: ${point.speedKmHr} km/hr <br/>`)
                                    .style("position", 'absolute')
                                    .style("padding", '4px')
                                    .style("left", (d.pageX - 100) + "px")
                                    .style("top", (d.pageY - 70) + "px");
                            })
                            .on("mouseout", (d) => {
                                div.transition()
                                    .duration(500)
                                    .style("visibility", "hidden")
                            })
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
        this.drawMap()
    }
}
