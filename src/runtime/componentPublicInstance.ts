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
        const { setupState } = instance
        if (key in setupState) {
            return setupState[key]
        }
        const publicGetter = publicPropertiesMap[key as string]
        if (publicGetter) {
            return publicGetter(instance)
        }
    }
}