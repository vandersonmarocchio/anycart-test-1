export namespace LocalStorageUtils {
    export function getItem(name: string) { return JSON.parse(localStorage.getItem(name)) }

    export function setItem(name: string, item: any) { localStorage.setItem(name, JSON.stringify(item)) }

    export function removeItem(name: string) { localStorage.removeItem(name) }

    export function clear() { localStorage.clear() }
}
