import { PublicInstanceProxyHandlers } from "./componentPublicInstance"

export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    }

    return component
}

export function setupComponent(instance: any) {
    // initProps
    // initSlots
    setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: any) {
    const Component = instance.type

    // ctx 代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component
    if (setup) {
        const setupResult = setup()
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance: any, setupResult: any) {
    // TODO: function object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}
function finishComponentSetup(instance: any) {
    const component = instance.type
    if (component.render) {
        instance.render = component.render
    }
}

