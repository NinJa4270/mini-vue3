import { shallowReadonly } from "../reactivity"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

export interface ComponentInternalInstance {
    proxy: any
    render: any
    vnode: any
    type: any
    setupState: any
    props: any
    emit: any
    slots: any
    provides: any,
    parent: ComponentInternalInstance | null
}

export function createComponentInstance(vnode: any, parent: ComponentInternalInstance | null = null) {
    const instance: ComponentInternalInstance = {
        proxy: null,
        render: null,
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent
    }
    instance.emit = emit.bind(null, instance) as any
    return instance
}

export function setupComponent(instance: ComponentInternalInstance) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatefulComponent(instance)
}


function setupStatefulComponent(instance: ComponentInternalInstance) {
    const Component = instance.type

    // ctx 代理
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers)

    const { setup } = Component
    if (setup) {
        setCurrentInstance(instance)
        const setupResult = setup(shallowReadonly(instance.props), { emit: instance.emit })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}

function handleSetupResult(instance: ComponentInternalInstance, setupResult: any) {
    // TODO: function object
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult
    }

    finishComponentSetup(instance)
}
function finishComponentSetup(instance: ComponentInternalInstance) {
    const component = instance.type
    if (component.render) {
        instance.render = component.render
    }
}
let currentInstance: ComponentInternalInstance | null = null
export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance: ComponentInternalInstance | null) {
    currentInstance = instance
}