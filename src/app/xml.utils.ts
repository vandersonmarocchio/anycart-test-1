export namespace XmlUtils {
    export function transformXmlToJson(xml) {
        var obj = {}
        if (xml.nodeType == 1) { // element
            if (xml.attributes.length > 0) {
                obj["attributes"] = {}
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j)
                    obj["attributes"][attribute.nodeName] = attribute.nodeValue
                }
            }
        }
        else if (xml.nodeType == 3 || xml.nodeType == 4) { // text and cdata section
            obj = xml.nodeValue
        }
        // do children
        if (xml.hasChildNodes()) {
            for (var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i)
                var nodeName = item.nodeName
                if (typeof (obj[nodeName]) == "undefined") {
                    obj[nodeName] = transformXmlToJson(item)
                } else {
                    if (typeof (obj[nodeName].length) == "undefined") {
                        var old = obj[nodeName]
                        obj[nodeName] = []
                        obj[nodeName].push(old)
                    }
                    if (typeof (obj[nodeName]) === 'object') {
                        obj[nodeName].push(transformXmlToJson(item))
                    }
                }
            }
        }
        return obj
    }
}
