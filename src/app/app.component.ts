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

    constructor(
        public jsonService: JsonService,
        public nextBus: NextBusService
    ) { }

    ngOnInit() {
        this.draeStreets(720, 720)
    }

    fetch() {
        this.nextBus.agencyList().then(resp => { console.log(XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))) })
        this.jsonService.getJson('assets/data/arteries.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/freeways.json').then(resp => console.log(resp))
        this.jsonService.getJson('assets/data/neighborhoods.json').then(resp => console.log(resp))
    }

    draeStreets(width: number, height: number) {
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
            console.log('oi')
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
