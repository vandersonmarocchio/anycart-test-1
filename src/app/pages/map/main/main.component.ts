import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import * as d3 from 'd3'
import * as moment from 'moment'
import 'moment-timezone'
import { RouteConfigInterface } from 'src/app/shared/interface/route-config.type'
import { JsonService } from 'src/app/shared/services/json.service'
import { NextBusService } from 'src/app/shared/services/next-bus.service'
import { GeoJsonUtils } from 'src/app/shared/utils/geojson.utils'
import { LocalStorageUtils } from 'src/app/shared/utils/local-storage.utils'
import { XmlUtils } from 'src/app/shared/utils/xml.utils'
import { BrowserDetect } from 'src/app/shared/utils/browser-detect.utils'

@Component({
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    public width: number = 0
    public height: number = 0
    public svg: any
    public map: any
    public projectionMap: any
    public geoPath: any
    public sourceMap: any
    public lastUpdatedTimeSanFrancisco: string
    public lastUpdatedTimeLocal: string

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
    public showStops: boolean = true
    public showRoute: boolean = true

    constructor(
        public jsonService: JsonService,
        public nextBusService: NextBusService,
        public actr: ActivatedRoute,
    ) {
        this.routeList = actr.snapshot.data.data
        const isMobile = BrowserDetect.detectMobile()
        this.width = isMobile ? 720 : screen.width / 2.5
        this.height = isMobile ? 720 : screen.width / 2.5
    }

    ngOnInit() {
        this.drawMap()
    }

    onChangeType(value) {
        this.typeSelected = value
        this.sourceMap = null
        this.drawMap()
    }

    onChangeRoute(value) {
        this.routeListSelected = value
        this.drawMap()
    }

    onChangeShowStops(value) {
        this.showStops = value
        this.drawMap()
    }

    onChangeShowRoute(value) {
        this.showRoute = value
        this.drawMap()
    }

    async drawMap() {
        // delete old svg and draw new
        d3.selectAll('svg#sf-map')
            .remove()
        this.svg = d3
            .select('#map')
            .append('svg')
            .attr('id', 'sf-map')
            .attr('width', this.width)
            .attr('height', this.height)

        this.map = this.svg.append('g')

        const zoomScale = d3
            .zoom()
            .scaleExtent([1, 40])
            .on('zoom', ({ transform }) => { this.map.attr('transform', transform) })

        if (!this.sourceMap) {
            this.sourceMap = await this.jsonService.getJson(`assets/data/${this.typeSelected}.json`).then(response => response)
        }

        this.projectionMap = d3.geoMercator().fitExtent([[0, 0], [this.width, this.height]], this.sourceMap)
        this.geoPath = d3.geoPath().projection(this.projectionMap)

        this.map.append('path')
            .datum(this.sourceMap)
            .attr('d', this.geoPath)
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5')
            .on('click', e => clicked)

        this.routeLoaded = []
        if (this.routeListSelected.length > 0) {
            for (let indexRoute = 0; indexRoute < this.routeListSelected.length; indexRoute++) {
                let route = LocalStorageUtils.getItem(btoa(this.routeListSelected[indexRoute])) || null
                if (route === null)
                    route = await this.nextBusService.routeConfig(this.routeListSelected[indexRoute]).then((resp) => XmlUtils.transformToRouteConfigInterface(resp))
                this.routeLoaded.push(route)
                if (this.showRoute) {
                    for (let index = 0; index < route.path.length; index++) {
                        this.map
                            .append('path')
                            .datum(GeoJsonUtils.transformPathToGeoJSON(route.path[index]))
                            .attr('d', this.geoPath)
                            .attr('fill', 'none')
                            .attr('stroke', route.color)
                            .attr('stroke-width', '1')
                            .on('click', e => clicked)
                    }
                }
                if (this.showStops) {
                    for (let index = 0; index < route.stop.length; index++) {
                        this.map
                            .append('circle')
                            .attr('id', 'stop' + route.title.replace(/[^a-zA-Z]+/g, '') + route.stop[index].stopId)
                            .attr('cx', this.projectionMap([route.stop[index].lon, route.stop[index].lat])[0])
                            .attr('cy', this.projectionMap([route.stop[index].lon, route.stop[index].lat])[1])
                            .attr('r', '1.5px')
                            .attr('fill', route.color)
                            .on('click', e => clicked)
                    }
                }
                LocalStorageUtils.setItem(btoa(this.routeListSelected[indexRoute]), route)
            }
        }

        function clicked(event, [x, y]) {
            event.stopPropagation()
            this.svg.transition().duration(750).call(
                zoomScale.transform,
                d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(40).translate(-x, -y),
            )
        }

        d3.select('#zoom_in')
            .on('click', () => zoomScale.scaleBy(this.svg.transition().duration(750), 1.2))

        d3.select('#zoom_out')
            .on('click', () => zoomScale.scaleBy(this.svg.transition().duration(750), 0.8))

        d3.select('#reset')
            .on('click', () => {
                this.svg.transition().duration(750).call(
                    zoomScale.transform,
                    d3.zoomIdentity,
                    d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
                )
            })

        this.svg.on('click', () => {
            this.svg.transition().duration(750).call(
                zoomScale.transform,
                d3.zoomIdentity,
                d3.zoomTransform(this.svg.node()).invert([this.width / 2, this.height / 2])
            )
        })

        this.svg.call(zoomScale)

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
            const time = moment().subtract('30', 'seconds')
            this.lastUpdatedTimeLocal = time.format('DD/MM/YYYY HH:mm:ss')
            this.lastUpdatedTimeSanFrancisco = time.tz('America/Los_Angeles').format('DD/MM/YYYY HH:mm:ss')
            await this.nextBusService.vehicleLocations(route.tag, time.toDate().getTime().toString()).then(async response => {
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

        const zoomScale = d3.zoom()
            .scaleExtent([1, 40])
            .on('zoom', ({ transform }) => { this.map.attr('transform', transform) })

        function clicked(event, [x, y]) {
            event.stopPropagation()
            this.svg.transition().duration(750).call(
                zoomScale.transform,
                d3.zoomIdentity.translate(this.width / 2, this.height / 2).scale(40).translate(-x, -y),
            )
        }
    }
}
