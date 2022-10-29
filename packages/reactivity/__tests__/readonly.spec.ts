import { expect, test, describe, vi } from 'vitest'
import { isReadonly, readonly } from '../src/reactive'


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

    test('nested readonly', () => {
        const original = { foo: 1, bar: { baz: 2 }, arr: [{ btn: 15 }, 2, 3] }
        const warpped = readonly(original)
        expect(warpped).not.toBe(original)
        expect(isReadonly(warpped)).toBe(true)
        expect(isReadonly(warpped.bar)).toBe(true)
        expect(isReadonly(warpped.arr)).toBe(true)
        expect(isReadonly(original.arr)).toBe(false)
    })
})