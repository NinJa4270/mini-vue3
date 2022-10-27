import { activeEffect, Dep, shouldTrack, trackEffects, triggerEffects } from "./effect";
import { isReactive, toReactive } from "./reactive";
import { hasChanged, } from "../shared";

class RefImpl<T> {
    private _value: T
    private _rawValue: T
    public dep: Dep
    public readonly __v_isRef = true
    constructor(value: T) {
        this._rawValue = value
        // 判断 value 是否为对象 如果是对象 需要用 reactive包裹
        this._value = toReactive(value)
        this.dep = new Set()
    }

    get value() {
        trackRefValue(this)
        return this._value
    }

    set value(newVal) {
        // 对比没有处理过的value 而不是 可能被 reactive后的value
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal
            this._value = toReactive(newVal)
            // 触发依赖
            triggerRefValue(this)
        }
    }
}



function trackRefValue(ref: RefImpl<any>) {
    if (shouldTrack && activeEffect) {
        // 依赖收集
        trackEffects(ref.dep)
    }
}

function triggerRefValue(ref: RefImpl<any>) {
    triggerEffects(ref.dep)
}

export function ref(value: any) {
    return new RefImpl(value)
}


export function isRef(ref: any) {
    return !!(ref?.__v_isRef === true)
}

export function unref(ref: any) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs: any) {
    return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, {
        get(target, key) {
            return unref(Reflect.get(target, key))
        },
        set(target, key, newVal) {
            const oldValue = target[key]
            // 原始值是 ref 新值不是 ref 去修改 value
            if (isRef(oldValue) && !isRef(newVal)) {
                return target[key].value = newVal
            } else {
                // 否则 直接去替换
                return Reflect.set(target, key, newVal)
            }
        }
    })
}