import { mutableHandlers, readonlyHandlers } from "./baseHandlers"

export function reactive(target: any) {
    return createReactiveObject(target, mutableHandlers)
}

export function readonly(target: any) {
    return createReactiveObject(target, readonlyHandlers)
}

function createReactiveObject(target: any, baseHandlers: any) {
    return new Proxy(
        target,
        baseHandlers
    )
}