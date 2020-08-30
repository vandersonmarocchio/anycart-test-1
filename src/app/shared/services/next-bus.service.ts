import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { XmlUtils } from '../utils/xml.utils'

@Injectable()
export class NextBusService {
    public url: string = 'http://webservices.nextbus.com/service/publicXMLFeed?command='

    constructor(public http: HttpClient) { }

    genericGet(path: string): Promise<any> {
        return this.http
            .get(path, { responseType: 'text' })
            .toPromise()
            .then(resp => {
                const result: any = XmlUtils.transformXmlToJson(new DOMParser().parseFromString(resp, "text/xml"))
                return result.body
            })
    }

    routeList(): Promise<any> {
        return this.genericGet(`${this.url}routeList&a=sf-muni`)
    }

    routeConfig(routeTag: string): Promise<any> {
        return this.genericGet(`${this.url}routeConfig&a=sf-muni&r=${routeTag}`)
    }

    vehicleLocations(routeTag: string, time: string): Promise<any> {
        return this.genericGet(`${this.url}vehicleLocations&a=sf-muni&r=${routeTag}&t=${time}`)
    }

    vehicleLocation(vehicleId: string): Promise<any> {
        return this.genericGet(`${this.url}vehicleLocation&a=sf-muni&v=${vehicleId}`)
    }
}
