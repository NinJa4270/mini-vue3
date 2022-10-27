import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {}
    }
    component.emit = emit.bind(null, component) as any
    return component
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: any) {
    const Component = instance.type

    // ctx 代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
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

