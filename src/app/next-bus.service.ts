import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable()
export class NextBusService {
    public url: string
    public options: any
    constructor(public http: HttpClient) {
        this.url = 'http://webservices.nextbus.com/service/publicXMLFeed?command='
        this.options = {
            responseType: 'text'
        }
    }

    routeList(): Promise<any> {
        return this.http.get(`${this.url}routeList&a=sf-muni`, this.options).toPromise();
    }

    routeConfig(routeTag: string): Promise<any> {
        return this.http.get(`${this.url}routeConfig&a=sf-muni&r=${routeTag}`, this.options).toPromise();
    }

    vehicleLocations(routeTag: string, time: string): Promise<any> {
        return this.http.get(`${this.url}vehicleLocations&a=sf-muni&r=${routeTag}&t=${time}`, this.options).toPromise();
    }

    vehicleLocation(vehicleId: string): Promise<any> {
        return this.http.get(`${this.url}vehicleLocation&a=sf-muni&v=${vehicleId}`, this.options).toPromise();
    }
}
