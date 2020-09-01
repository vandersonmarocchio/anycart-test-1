import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable()
export class JsonService {
    constructor(public httpClient: HttpClient) { }
    getJson(path: string): Promise<any> {
        return this.httpClient.get(path).toPromise()
    }
}
