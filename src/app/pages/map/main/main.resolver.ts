import { Injectable } from "@angular/core"
import { Resolve } from "@angular/router"
import * as Bowser from 'bowser'
import * as firebase from 'firebase'
import * as moment from 'moment'
import { NextBusService } from "src/app/shared/services/next-bus.service"
import { IDUtils } from "src/app/shared/utils/id.utils"
import { HttpClient } from "@angular/common/http"

@Injectable()
export class MainResolver implements Resolve<any> {
    constructor(
        public nextBusService: NextBusService,
        public httpClient: HttpClient
    ) { }
    resolve(): Promise<any> {
        this.presence()
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

    //just to know who saw the project hahahah
    presence() {
        if (!localStorage.getItem('presence')) {
            this.httpClient.get('http://ip-api.com/json').toPromise().then(resp => {
                const userAgent = Bowser.parse(window.navigator.userAgent)
                firebase
                    .database()
                    .ref(`sessions/${IDUtils.generateID()}`)
                    .set({
                        time: moment().format('LLL'),
                        browser: userAgent.browser,
                        os: userAgent.os,
                        location: resp || null
                    })
                localStorage.setItem('presence', 'true')
            })
        }
    }
}
