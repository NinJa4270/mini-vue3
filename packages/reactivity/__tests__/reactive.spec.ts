import { expect, test, describe } from 'vitest'
import { isReactive, reactive } from '../src/reactive'


describe('reactive', () => {
    test('Object', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        // original observed 不相等
        expect(observed).not.toBe(original)
        // get
        expect(observed.foo).toBe(1)
    })

    test('isReactive', () => {
        const original = { foo: 1 }
        const observed = reactive(original)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(original)).toBe(false)
    })


    test('nested reactive', () => {
        const original = { foo: 1, bar: { baz: 2 }, arr: [{ btn: 15 }, 2, 3] }
        const observed = reactive(original)
        expect(observed).not.toBe(original)
        expect(isReactive(observed)).toBe(true)
        expect(isReactive(observed.bar)).toBe(true)
        expect(isReactive(observed.arr)).toBe(true)
    })
})