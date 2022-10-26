
interface ReactiveEffectRunner<T = any> {
    (): T
    effect: ReactiveEffect
}
type EffectScheduler = (...args: any[]) => any
interface ReactiveEffectOptions {
    scheduler?: EffectScheduler
}

let activeEffect: ReactiveEffect // 用来向 tarck 传递 effect fn 做依赖收集
class ReactiveEffect<T = any>{
    constructor(public fn: () => T, public scheduler?: EffectScheduler) {
        this.fn = fn
    }

    run() {
        activeEffect = this
        return this.fn()
    }
}
// 副作用
export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions): ReactiveEffectRunner {
    const scheduler = options?.scheduler
    const _effect = new ReactiveEffect(fn, scheduler)

    _effect.run()
    const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
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
const targetMap = new Map()
export function track(target: any, key: unknown) {
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
    // 考虑如何拿到 effect中的 fn ？
    // 通过一个全局变量 activeEffect 来传递
    dep.add(activeEffect)
}

// 依赖通知
export function trigger(target: any, key: unknown) {
    let depsMap = targetMap.get(target)
    let dep = depsMap.get(key)


    dep.forEach((_effect: ReactiveEffect) => {
        if (_effect.scheduler) {
            _effect.scheduler()
        } else {
            _effect.run()
        }
    })

}