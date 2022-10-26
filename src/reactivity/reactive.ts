import { mutableHandlers, readonlyHandlers, shallowReadonlyHandlers } from "./baseHandlers"

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
}

export interface Target {
    [ReactiveFlags.IS_REACTIVE]?: boolean
    [ReactiveFlags.IS_READONLY]?: boolean
}


export function reactive(target: any) {
    return createReactiveObject(target, mutableHandlers)
}

export function readonly(target: any) {
    return createReactiveObject(target, readonlyHandlers)
}

export function shallowReadonly(target: any) {
    return createReactiveObject(target, shallowReadonlyHandlers)
}


function createReactiveObject(target: any, baseHandlers: any) {
    return new Proxy(
        target,
        baseHandlers
    )
}

export function isReactive(value: unknown): boolean {
    return !!(value as Target)[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: unknown): boolean {
    return !!(value as Target)[ReactiveFlags.IS_READONLY]
}


export function isProxy(value: unknown): boolean {
    return isReactive(value) || isReadonly(value)
}