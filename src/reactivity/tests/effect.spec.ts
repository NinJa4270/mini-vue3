import { expect, test, describe } from 'vitest'
import { effect } from '../effect'
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
})