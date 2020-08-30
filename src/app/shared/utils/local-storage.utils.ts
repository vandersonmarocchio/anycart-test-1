export namespace LocalStorageUtils {
    export function getItem(name) { return JSON.parse(localStorage.getItem(name)) }

    export function setItem(name, item) { localStorage.setItem(name, JSON.stringify(item)) }

    export function removeItem(name) { localStorage.removeItem(name) }

    export function clear() { localStorage.clear() }
}
