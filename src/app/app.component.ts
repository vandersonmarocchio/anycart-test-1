import { Component, OnInit } from '@angular/core'
import * as d3 from 'd3'
import { JsonService } from './json.service'
import { NextBusService } from './next-bus.service'
import { XmlUtils } from './xml.utils'
import { GeoJsonUtils } from './geojson.utils'
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public isLoading: boolean = false
    public streetList: any

    public routeLoaded: any
    public routeList: any[] = []
    public routeSelected: string
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

    public vehicleList: any[] = []

    public interval

    constructor(
        public jsonService: JsonService,
        public nextBusService: NextBusService
    ) { }

    ngOnInit() {
        this.nextBusService.routeList().then(resp => {
            const data: any = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))
            data.body.route.forEach(route => {
                const option = {
                    value: route.tag,
                    view: route.title
                }
                this.routeList = [...this.routeList, option]
            })
        })
        this.drawStreets(720, 720)
    }

    onChangeType(value) {
        this.typeSelected = value
        this.streetList = null
        this.drawStreets(720, 720)
    }

    onChangeRoute(value) {
        this.routeSelected = value
        this.drawStreets(720, 720)
    }

    async drawStreets(width: number, height: number) {
        this.isLoading = true

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on("zoom", zoomed)

        d3.select("body")
            .selectAll("svg")
            .remove()

        const svg = d3
            .select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset)

        const map = svg.append("g")

        if (!this.streetList) {
            await this.jsonService.getJson(`assets/data/${this.typeSelected}.json`).then(response => this.streetList = response)
        }

        const projectionMap = d3.geoMercator().fitExtent([[0, 0], [width, height]], this.streetList)
        const pathGenerator = d3.geoPath().projection(projectionMap)

        map.append('path')
            .datum(this.streetList)
            .attr('d', pathGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#999999')
            .attr('stroke-width', '0.5')
            .on("click", e => clicked)

        if (this.routeSelected) {
            this.nextBusService.routeConfig(this.routeSelected).then(resp => {
                this.routeLoaded = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))
                for (let index = 0; index < this.routeLoaded.body.route.path.length; index++) {

                    const path = this.routeLoaded.body.route.path[index]
                    const routeData: any = GeoJsonUtils.transformGeoJSON(path)

                    map.append('path')
                        .datum(routeData)
                        .attr('d', pathGenerator)
                        .attr('fill', 'none')
                        .attr('stroke', "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")")
                        .attr('stroke-width', '0.5')
                        .on("click", e => clicked)

                }

                this.nextBusService.vehicleLocations(this.routeSelected, new Date().getTime().toString()).then(response => {
                    const responseData: any = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(response, "text/xml"))
                    if (responseData.body.vehicle) {
                        this.vehicleList = responseData.body.vehicle
                        let coordinatesVehicleList = []
                        this.vehicleList.forEach(point => {
                            coordinatesVehicleList = [...coordinatesVehicleList, [point.lon, point.lat]]
                        })

                        console.log(coordinatesVehicleList)

                        map.selectAll('path')
                            .data(coordinatesVehicleList)
                            .enter()
                            .append("circle")
                            .attr("cx", (d) => { return projectionMap(d)[0] })
                            .attr("cy", (d) => { return projectionMap(d)[1] })
                            .attr("r", "2px")
                            .attr("fill", '#000')
                            .on("click", e => clicked)
                    }
                })
                this.isLoading = false
            })
        }
        this.isLoading = false

        svg.call(zoom)

        function reset() {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
            )
        }

        d3.select("#reset").on("click", reset)

        function clicked(event, [x, y]) {
            event.stopPropagation()
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
            )
        }

        function zoomed({ transform }) {
            map.attr("transform", transform)
        }
    }
}
