
interface ReactiveEffectRunner<T = any> {
    (): T
    effect: ReactiveEffect
}
type EffectScheduler = (...args: any[]) => any
interface ReactiveEffectOptions {
    scheduler?: EffectScheduler
    onStop?: () => void
}

export const extend = Object.assign

export let shouldTrack = true // 是否应该收集依赖的标识
export let activeEffect: ReactiveEffect // 用来向 tarck 传递 effect fn 做依赖收集
class ReactiveEffect<T = any>{
    public deps: any
    active = true
    scheduler?: EffectScheduler
    onStop?: () => void
    constructor(public fn: () => T) {
        this.fn = fn
        this.deps = []
    }
    run() {
        // shouldTrack 来处理是否收集依赖
        if (!this.active) {
            return this.fn()
        }
        shouldTrack = true
        activeEffect = this
        // reset
        const result = this.fn()
        shouldTrack = false
        return result
    }
    stop() {
        // 通过 effect 找到 dep 并清除
        // this.active 优化 多次调用stop时 不需要再去清空
        if (this.active) {
            cleanupEffect(this)
            if (this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect(effect: ReactiveEffect) {
    const { deps } = effect
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect)
        }
        deps.length = 0
    }
}

// 副作用
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions): ReactiveEffectRunner {
    // const scheduler = options?.scheduler
    // const onStop = options?.onStop
    const _effect = new ReactiveEffect(fn)
    extend(_effect, options)
    // _effect.onStop = onStop
    // _effect.scheduler = scheduler

    _effect.run()
    const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
    runner.effect = _effect
    return runner
}



// 依赖收集
/**
 * targetMap {
 *  target1:{
 *      key1:[dep1,dep2],
 *  },
 *  target2:{}, 
 * }
 */

export type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export function track(target: any, key: unknown) {
    if (activeEffect && shouldTrack) {
        // target => key => dep
        // 获取 target => (key=>dep map)  
        let depsMap = targetMap.get(target)
        // 初始化 (key=>dep set) 容器
        if (!depsMap) {
            depsMap = new Map()
            targetMap.set(target, depsMap)
        }
        // 获取 key=> (dep set) 
        let dep = depsMap.get(key)
        // 初始化 (dep map)  容器
        if (!dep) {
            dep = new Set()
            depsMap.set(key, dep)
        }

        trackEffects(dep)
    }
}

// 抽离依赖收集逻辑 给ref使用
export function trackEffects(dep: Dep) {
    // 优化 处理重复收集
    if (!dep.has(activeEffect)) {
        // 考虑如何拿到 effect中的 fn ？
        // 通过一个全局变量 activeEffect 来传递
        dep.add(activeEffect)
        // 考虑如何在 effect 中找到 dep
        // 通过反向收集
        activeEffect.deps.push(dep)
    }
}

// 依赖通知
export function trigger(target: any, key: unknown) {
    const depsMap = targetMap.get(target)
    const dep = depsMap!.get(key)
    triggerEffects(dep)
}
// 抽离依赖通知逻辑 给ref使用
export function triggerEffects(dep?: Dep) {
    dep!.forEach((_effect: ReactiveEffect) => {
        if (_effect.scheduler) {
            _effect.scheduler()
        } else {
            _effect.run()
        }
    })
}



export function stop(runner: ReactiveEffectRunner) {
    runner.effect.stop()
}