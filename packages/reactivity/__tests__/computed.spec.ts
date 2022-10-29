import { expect, test, describe, vi } from 'vitest'
import { computed } from '../src/computed'
import { reactive } from '../src/reactive'

describe('computed', () => {

    test('computed', () => {
        const user = reactive({
            age: 10
        })

        const age = computed(() => {
            return user.age
        })

        expect(age.value).toBe(10)
    })


    test('computed lazy', () => {
        const user = reactive({
            age: 10
        })

        const getter = vi.fn(() => {
            return user.age
        })

        const cUser = computed(getter)
        expect(getter).not.toHaveBeenCalled()

        expect(cUser.value).toBe(10)
        expect(getter).toBeCalledTimes(1)

        // 懒执行
        cUser.value;
        expect(getter).toBeCalledTimes(1)

        user.age = 20
        expect(getter).toBeCalledTimes(1)
        expect(cUser.value).toBe(20)
        expect(getter).toBeCalledTimes(2)

        cUser.value;
        expect(getter).toBeCalledTimes(2)
    })
})