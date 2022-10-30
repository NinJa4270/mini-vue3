import { ReactiveEffect } from "@ninja/reactivity";
import { queuePostFlushCb } from "./scheduler";

export function watchEffect(source: any) {
    function job() {
        effect.run()
    }

    let cleanup: any
    const onCleanup = function (fn: any) {
        cleanup = effect.onStop = () => {
            fn()
        }
    }

    function getter() {
        if (cleanup) cleanup()
        source(onCleanup)

    }

    const effect = new ReactiveEffect(getter, () => {
        // 需要将fn添加到组件渲染之前
        queuePostFlushCb(job)
    })

    effect.run()
    return () => {
        effect.stop()
    }
}