import { expect, test, describe } from 'vitest'
import { isReactive, reactive } from '../reactive'


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
})