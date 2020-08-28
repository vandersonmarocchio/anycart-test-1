import { HttpClient, HttpHeaders } from '@angular/common/http'
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
    vehicleLocation(agencyTag: string, vehicleId: string): Promise<any> {
        return this.http.get(`${this.url}vehicleLocation&a=${agencyTag}&v=${vehicleId}`, this.options).toPromise();
    }
    agencyList(): Promise<any> {
        return this.http.get(`${this.url}agencyList`, this.options).toPromise();
    }
    routeList(agencyTag: string): Promise<any> {
        return this.http.get(`${this.url}routeList&a${agencyTag}`, this.options).toPromise();
    }
}
