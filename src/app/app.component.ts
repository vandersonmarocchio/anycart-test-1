import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { JsonService } from './json.service';
import { NextBusService } from './next-bus.service';
import { XmlUtils } from './xml.utils';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    public isLoading: boolean = false
    public agencyTag = 'sf-muni'
    public streetList: any
    public projectionMap
    public routeList: any[] = []
    public routeSelected: any
    constructor(
        public jsonService: JsonService,
        public nextBusService: NextBusService
    ) { }

    ngOnInit() {
        this.nextBusService.routeList(this.agencyTag).then(resp => {
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

    onChangeRoute(value) {
        this.routeSelected = value
        this.drawStreets(720, 720)
    }

    drawStreets(width: number, height: number) {
        this.isLoading = true

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on("zoom", zoomed);

        d3.select("body")
            .selectAll("svg")
            .remove()

        const svg = d3
            .select("#map")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        const g = svg.append("g");

        this.jsonService.getJson('assets/data/streets.json').then(response => {
            this.streetList = response
            this.projectionMap = d3.geoMercator().fitExtent([[0, 0], [width, height]], this.streetList)

            const pathGenerator = d3.geoPath().projection(this.projectionMap)

            g.append('path')
                .datum(this.streetList)
                .attr('d', pathGenerator)
                .attr('fill', 'none')
                .attr('stroke', '#999999')
                .attr('stroke-width', '0.5')
                .on("click", e => clicked)

            if (this.routeSelected) {
                this.nextBusService.routeConfig(this.agencyTag, this.routeSelected).then(resp => {
                    const data: any = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))
                    console.log(data)
                    const color = data.body.route.color

                    for (let index = 0; index < data.body.route.path.length; index++) {
                        const path = data.body.route.path[index]
                        let coordinatesPath = []
                        path.point.forEach(point => {
                            coordinatesPath = [...coordinatesPath, [point.lon, point.lat]]
                        });
                        g.selectAll('path' + index)
                            .data(coordinatesPath)
                            .enter()
                            .append("circle")
                            .attr("cx", (d) => { return this.projectionMap(d)[0]; })
                            .attr("cy", (d) => { return this.projectionMap(d)[1]; })
                            .attr("r", "1px")
                            .attr("fill", "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")"
                            )
                    }

                    this.isLoading = false
                })
            }
            this.isLoading = false
        })

        svg.call(zoom);

        function reset() {
            console.log('oi')
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
            )
        }

        d3.select("#reset").on("click", reset)

        function clicked(event, [x, y]) {
            event.stopPropagation();
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
            )
        }

        function zoomed({ transform }) {
            g.attr("transform", transform)
        }
    }

    fetch() {
        this.nextBusService.agencyList().then(resp => { console.log(XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))) })
        this.jsonService.getJson('assets/data/arteries.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/freeways.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/neighborhoods.json').then(resp => console.log(resp))
    }
}
