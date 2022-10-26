let activeEffect: ReactiveEffect // 用来向 tarck 传递 effect fn 做依赖收集
class ReactiveEffect<T = any>{
    constructor(public fn: () => T) {
        this.fn = fn
    }

    run() {
        console.log('触发 run');
        activeEffect = this
        this.fn()
    }
}
// 副作用
export function effect<T = any>(fn: () => T) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
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
        _effect.run()
    })

}