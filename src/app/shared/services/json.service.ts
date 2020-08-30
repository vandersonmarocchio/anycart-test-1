import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

@Injectable()
export class JsonService {
    constructor(public http: HttpClient) { }
    getJson(path): Promise<any> {
        return this.http.get(path).toPromise()
    }
}
