import { getCurrentInstance } from "./component";

export function provide(key: string, value: any) {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance
        const parentProvides = currentInstance.parent?.provides || {}
        if (provide === parentProvides) {
            // 利用原型链
            provides = currentInstance.provides = Object.create(parentProvides)
        }
        provides[key] = value
    }
}

export function inject(key: string, defalutValue: any) {
    const currentInstance = getCurrentInstance()
    if (currentInstance) {
        const parentProvides = currentInstance.parent?.provides
        if (key in parentProvides) {
            return parentProvides[key]
        } else if (defalutValue !== undefined) {
            if (typeof defalutValue === 'function') {
                return defalutValue()
            }
            return defalutValue
        }
    }
}