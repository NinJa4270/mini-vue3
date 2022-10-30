import { reactive } from "@ninja/reactivity"
import { watchEffect } from "../src/apiWatch"
import { nextTick } from "../src/scheduler"

describe(' watch', () => {
    test('effect', async () => {
        const state = reactive({ count: 0 })
        let dummy
        watchEffect(() => {
            dummy = state.count
        })
        expect(dummy).toBe(0)
        state.count++
        await nextTick()
        expect(dummy).toBe(1)
    })


    test("stop", async () => {
        const state = reactive({ count: 0 })
        let dummy
        const stop = watchEffect(() => {
            dummy = state.count
        })
        expect(dummy).toBe(0)

        stop()
        state.count++
        await nextTick()
        expect(dummy).toBe(0)
    })


    test("cleanup", async () => {
        const state = reactive({ count: 0 })
        const cleanup = vi.fn()
        let dummy
        const stop = watchEffect((onCleanup: any) => {
            onCleanup(cleanup)
            dummy = state.count
        })
        expect(dummy).toBe(0)

        state.count++
        await nextTick()
        expect(cleanup).toHaveBeenCalledTimes(1)
        expect(dummy).toBe(1)
        
        stop()
        expect(cleanup).toHaveBeenCalledTimes(2)
    })
})