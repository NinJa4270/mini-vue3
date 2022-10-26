
import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

// 优化点 只创建一次 不需要每次都创建
const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function get(target: any, key: string | symbol) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)
        // 依赖收集
        if (!isReadonly) {
            track(target, key)
        }
        return res
    }
}

function createSetter() {
    return function set(target: any, key: string | symbol, newValue: any) {
        const res = Reflect.set(target, key, newValue)
        //  依赖触发
        trigger(target, key)
        return res
    }
}

export const mutableHandlers = {
    get,
    set
}

export const readonlyHandlers = {
    get: readonlyGet,
    set(target: any, key: unknown) {
        console.warn(`Set operation on key "${String(key)}" failed: target is readonly.`, target)
        return true
    },
}