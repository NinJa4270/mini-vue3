import { hasOwn } from "../shared"
import { ComponentInternalInstance } from "./component"

export type PublicPropertiesMap = Record<
    string,
    (i: ComponentInternalInstance) => any
>
const publicPropertiesMap: PublicPropertiesMap = {
    $el: (i: ComponentInternalInstance) => i.vnode.el,
    $slots: (i: ComponentInternalInstance) => i.slots,
    $props: (i: ComponentInternalInstance) => i.props
} as PublicPropertiesMap

export const PublicInstanceProxyHandlers: ProxyHandler<any> = {
    get({ _: instance }, key) {
        // steupState
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return setupState[key]
        } else if (hasOwn(props, key)) {
            // props
            return props[key]
        }

        const publicGetter = publicPropertiesMap[key as string]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}