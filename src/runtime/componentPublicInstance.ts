import { hasOwn } from "../shared"

export type PublicPropertiesMap = Record<
    string,
    (i: any) => any
>
const publicPropertiesMap: PublicPropertiesMap = {
    $el: (i: any) => i.vnode.el
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