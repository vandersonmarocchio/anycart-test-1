import { RouteConfigInterface } from "../interface/route-config.type"

export namespace XmlUtils {
    export function transformXmlToJson(xml: any) {
        let object = {}
        if (xml.nodeType == 1) {
            if (xml.attributes.length > 0) {
                for (let j = 0; j < xml.attributes.length; j++) {
                    let attribute = xml.attributes.item(j)
                    object[attribute.nodeName] = attribute.nodeValue
                }
            }
        }
        else if (xml.nodeType == 3 || xml.nodeType == 4) object = xml.nodeValue
        if (xml.hasChildNodes()) {
            for (let i = 0; i < xml.childNodes.length; i++) {
                let item = xml.childNodes.item(i)
                let nodeName = item.nodeName
                if (typeof (object[nodeName]) == 'undefined') {
                    object[nodeName] = transformXmlToJson(item)
                } else {
                    if (typeof (object[nodeName].length) == 'undefined') {
                        let old = object[nodeName]
                        object[nodeName] = []
                        object[nodeName].push(old)
                    }
                    if (typeof (object[nodeName]) === 'object') object[nodeName].push(transformXmlToJson(item))
                }
            }
        }
        return object
    }

    export function transformToRouteConfigInterface(object: any): RouteConfigInterface {
        return {
            color: '#' + object.route.color,
            oppositeColor: '#' + object.route.oppositeColor,
            title: object.route.title,
            tag: object.route.tag,
            direction: object.route.direction,
            path: object.route.path,
            stop: object.route.stop,
        }
    }
}
