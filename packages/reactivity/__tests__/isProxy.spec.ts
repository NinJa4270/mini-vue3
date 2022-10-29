import { expect, test, describe } from 'vitest'
import { isProxy, reactive, readonly, shallowReadonly } from '../src/reactive'

describe('isProxy', () => {

    test('isProxy', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const observed = reactive(original)
        const warpped = readonly(original)
        const shallowWarpped = shallowReadonly(original)

        expect(isProxy(original)).toBe(false)
        expect(isProxy(observed)).toBe(true)
        expect(isProxy(warpped)).toBe(true)
        expect(isProxy(shallowWarpped)).toBe(true)
        expect(isProxy(shallowWarpped.bar)).toBe(false)
    })
})