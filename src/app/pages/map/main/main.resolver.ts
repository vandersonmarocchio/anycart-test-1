import { Injectable } from "@angular/core"
import { Resolve } from "@angular/router"
import { NextBusService } from "src/app/shared/services/next-bus.service"
import { XmlUtils } from "src/app/shared/utils/xml.utils"
@Injectable()
export class MainResolver implements Resolve<any> {
    constructor(public nextBusService: NextBusService) { }
    resolve(): Promise<any> {
        return this.nextBusService.routeList().then(response => {
            let routeList = []
            for (const route of response.route) {
                routeList = [
                    ...routeList,
                    {
                        value: route.tag,
                        view: route.title
                    }
                ]
            }
            return routeList
        })
    }
}
