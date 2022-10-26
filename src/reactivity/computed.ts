import { ReactiveEffect } from "./effect"

export type ComputedGetter<T> = (...args: any[]) => T

class ComputedRefImpl<T> {
    public _dirty = true
    private _value!: T
    effect: ReactiveEffect<T>
    constructor(getter: ComputedGetter<T>) {
        this.effect = new ReactiveEffect(getter, () => {  // scheduler
            if (!this._dirty) {
                this._dirty = true
            }
        })
    }

    get value() {
        if (this._dirty) {
            this._dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }
}



export function computed<T>(getter: ComputedGetter<T>) {
    return new ComputedRefImpl(getter)
}