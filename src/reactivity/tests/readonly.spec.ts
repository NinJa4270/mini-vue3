import { expect, test, describe, vi } from 'vitest'
import { isReadonly, readonly } from '../reactive'


describe('readonly', () => {

    test('readonly', () => {
        const original = { foo: 1, bar: { baz: 2 } }
        const warpped = readonly(original)
        expect(warpped).not.toBe(original)
        expect(warpped.foo).toBe(1)
    })


    test('warn readonly set', () => {
        console.warn = vi.fn()
        const original = { foo: 1 }
        const warpped = readonly(original)
        warpped.foo++
        expect(console.warn).toBeCalled()
    })

    test('isReadonly', () => {
        const original = { foo: 1 }
        const warpped = readonly(original)
        expect(isReadonly(warpped)).toBe(true)
        expect(isReadonly(original)).toBe(false)
    })
})