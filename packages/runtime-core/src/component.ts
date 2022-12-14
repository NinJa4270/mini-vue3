import { proxyRefs, shallowReadonly } from "@ninja/reactivity"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { PublicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"
import { VNode } from "./vnode"

let compiler: any
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
    subTree: any,
    parent: ComponentInternalInstance | null
    isMounted: boolean
    update: any
    next: VNode | null

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
        parent,
        subTree: null,

        isMounted: false,
        update: null,
        next: null
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

    // ctx ไปฃ็
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
        // ้่ฟ  proxyRefs ๆฏ setup ่ฟๅๅผ ไธ้่ฆ่ฎฟ้ฎ .value
        instance.setupState = proxyRefs(setupResult)
    }

    finishComponentSetup(instance)
}
function finishComponentSetup(instance: ComponentInternalInstance) {
    const component = instance.type

    if (compiler && !component.render) {
        if (component.template) {
            component.render = compiler(component.template)
        }
    }
    instance.render = component.render
}
let currentInstance: ComponentInternalInstance | null = null
export function getCurrentInstance() {
    return currentInstance
}

function setCurrentInstance(instance: ComponentInternalInstance | null) {
    currentInstance = instance
}


export function registerRuntimeCompiler(_compiler: any) {
    compiler = _compiler
}