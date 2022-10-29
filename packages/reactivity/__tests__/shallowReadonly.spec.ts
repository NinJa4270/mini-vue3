import { expect, test, describe, vi } from 'vitest'
import { isReadonly, readonly, shallowReadonly } from '../src/reactive'


describe('shallowReadonly', () => {

    test('shallowReadonly', () => {
        console.warn = vi.fn()

        const original = { foo: 1, bar: { baz: 2 } }
        const warpped = shallowReadonly(original)
        expect(warpped).not.toBe(original)
        expect(isReadonly(warpped)).toBe(true)
        expect(isReadonly(warpped.bar)).toBe(false)

        warpped.foo++
        expect(console.warn).toBeCalled()
        expect(warpped.foo).toBe(1)
        warpped.bar.baz++
        expect(warpped.bar.baz).toBe(3)
    })
})