import { Injectable } from "@angular/core"
import { Resolve } from "@angular/router"
import * as Bowser from 'bowser'
import * as firebase from 'firebase/app'
import * as moment from 'moment'
import { NextBusService } from "src/app/shared/services/next-bus.service"
import { IDUtils } from "src/app/shared/utils/id.utils"

@Injectable()
export class MainResolver implements Resolve<any> {
    constructor(public nextBusService: NextBusService) { }
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

    //just to know who saw my project hahahah
    presence() {
        const alreadySendPresence = localStorage.getItem('presence')
        if (!alreadySendPresence) {
            const userAgent = Bowser.parse(window.navigator.userAgent)
            firebase
                .database()
                .ref(`sessions/${IDUtils.generateID()}`)
                .set({
                    time: moment().format('LLL'),
                    browser: userAgent.browser,
                    os: userAgent.os
                })
            localStorage.setItem('presence', 'true')
        }
    }
}
