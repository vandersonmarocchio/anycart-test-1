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
    public agencyTag = 'sf-muni'
    constructor(
        public jsonService: JsonService,
        public nextBusService: NextBusService
    ) { }

    ngOnInit() {
        this.drawStreets(720, 720)
        this.drawRoute()
    }

    fetch() {
        this.nextBusService.agencyList().then(resp => { console.log(XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))) })
        this.jsonService.getJson('assets/data/arteries.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/freeways.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/neighborhoods.json').then(resp => console.log(resp))
    }

    drawRoute() {
        this.nextBusService.routeConfig(this.agencyTag, '1').then(resp => {
            const data: any = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))
            data.body.route.path.forEach(element => {
                element.point.forEach(point => {
                    console.log(point.lon)
                    console.log(point.lat)
                });
            })
        })
    }

    drawStreets(width: number, height: number) {
        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .on("zoom", zoomed);

        const svg = d3
            .select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("click", reset);

        const g = svg.append("g");

        this.jsonService.getJson('assets/data/streets.json').then(response => {
            const streetList = response
            const projection = d3.geoMercator().fitExtent([[0, 0], [width, height]], streetList)
            const pathGenerator = d3.geoPath().projection(projection)
            g.append('path')
                .datum(streetList)
                .attr('d', pathGenerator)
                .attr('fill', 'none')
                .attr('stroke', '#999999')
                .attr('stroke-width', '0.5')
                .on("click", e => clicked);
        })

        svg.call(zoom);

        function reset() {
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity,
                d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
            );
        }

        d3.select("#reset").on("click", reset)

        function clicked(event, [x, y]) {
            event.stopPropagation();
            svg.transition().duration(750).call(
                zoom.transform,
                d3.zoomIdentity.translate(width / 2, height / 2).scale(40).translate(-x, -y),
            );
        }

        function zoomed({ transform }) {
            g.attr("transform", transform);
        }
    }
}
