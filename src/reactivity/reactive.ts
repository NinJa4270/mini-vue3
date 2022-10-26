import { track, trigger } from "./effect"

export function reactive(target: any) {

    const result = new Proxy(target, {

        get(target, key) {
            const res = Reflect.get(target, key)
            // 依赖收集
            track(target, key)
            return res
        },

        set(target, key, newValue) {
            const res = Reflect.set(target, key, newValue)
            //  依赖触发
            trigger(target, key)
            return res
        }
    })

    return result
}