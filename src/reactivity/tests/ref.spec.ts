import { expect, test, describe, vi } from 'vitest'
import { effect } from '../effect'
import { ref } from '../ref'

describe('ref', () => {

    test('ref', () => {
        const count = ref(10)
        expect(count.value).toBe(10)
    })


    test('ref should be reactive', () => {
        const count = ref(10)
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = count.value
        })

        expect(calls).toBe(1)
        expect(dummy).toBe(10)

        count.value = 20
        expect(calls).toBe(2)
        expect(dummy).toBe(20)

        count.value = 20
        expect(calls).toBe(2)
        expect(dummy).toBe(20)
    })

    test('ref receive an object', () => {
        const count = ref({
            a: 1
        })
        let dummy
        effect(() => {
            dummy = count.value.a
        })

        expect(dummy).toBe(1)
        count.value.a = 2
        expect(dummy).toBe(2)
    })
})