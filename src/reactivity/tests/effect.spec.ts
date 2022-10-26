import { expect, test, describe, vi } from 'vitest'
import { effect, stop } from '../effect'
import { reactive } from '../reactive'


describe('effect', () => {

    test('observe basic properties', () => {
        // init
        const count = reactive({
            number: 10
        })
        let result
        effect(() => {
            result = count.number
        })
        expect(result).toBe(10)
        count.number++
        // 触发依赖收集 触发依赖更新 update
        expect(result).toBe(11)
    })


    test('runner', () => {
        let foo = 10
        const runner = effect(() => {
            foo++
            return 'foo'
        })
        expect(foo).toBe(11)
        const r = runner()
        expect(foo).toBe(12)
        expect(r).toBe('foo')
    })


    test('scheduler', () => {
        // 1. 给 effect 传入配置选项 scheduler 
        // 2. effect 第一次执行 第一参数 fn
        // 3. 当响应式对象发生变化时 不执行第一个fn 而执行 scheduler 
        // 4. 执行 runner 时 才会再执行 fn
        let dummy
        let run: any
        const scheduler = vi.fn(() => {
            run = runner
        })
        const obj = reactive({ foo: 1 })
        const runner = effect(
            () => {
                dummy = obj.foo
            },
            { scheduler }
        )
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        // should be called on first trigger
        obj.foo++
        expect(scheduler).toHaveBeenCalledTimes(1)
        // should not run yet
        expect(dummy).toBe(1)
        // manually run
        run()
        // should have run
        expect(dummy).toBe(2)
    })



    test('stop', () => {
        let dummy
        const obj = reactive({ prop: 1 })
        const runner = effect(() => {
            dummy = obj.prop
        })
        obj.prop = 2
        expect(dummy).toBe(2)
        // 停止监测更新
        stop(runner)
        obj.prop = 3
        expect(dummy).toBe(2)

        // stopped effect should still be manually callable
        runner()
        expect(dummy).toBe(3)
    })


    test('onStop', () => {
        const obj = reactive({ prop: 1 })
        const onStop = vi.fn()
        let dummy

        const runner = effect(() => {
            dummy = obj.prop
        }, {
            onStop
        })
        stop(runner)
        expect(onStop).toBeCalledTimes(1)
    })

})