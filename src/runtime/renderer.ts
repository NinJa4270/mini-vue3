import { ShapeFlags } from "../shared/shapeFlags";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode: any, container: HTMLElement,) {
    // patch
    patch(vnode, container, null)
}

function patch(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    // 判断处理
    const { type, shapeFlag } = vnode

    // 需要特殊处理的 type 
    switch (type) {
        case Fragment:
            processFragment(vnode, container, parentComponent)
            break
        case Text:
            processText(vnode, container)
            break
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container, parentComponent)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container, parentComponent)
            }
            break
    }

}

// 处理 element
function processElement(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    // init 
    mountElement(vnode, container, parentComponent)
    // update
}
function mountElement(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    // 存到 vnode 上
    const el: HTMLElement = (vnode.el = document.createElement(vnode.type))
    const { children, props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el, parentComponent)
    }

    // props
    const isOn = (key: string) => /^on[A-Z]/.test(key)
    for (let key in props) {
        const prop = props[key]
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase()
            el.addEventListener(event, prop)
        } else {
            el.setAttribute(key, prop)
        }
    }

    container.append(el)
}

function mountChildren(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    vnode.children.forEach((v: any) => {
        patch(v, container, parentComponent)
    })
}

// 处理 component
function processComponent(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    mountComponent(vnode, container, parentComponent)
}

function mountComponent(initialVNode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    const instance = createComponentInstance(initialVNode, parentComponent)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container, instance)

    // 组件的 所有的 element 都处理完毕
    // 将根节点的el 赋值到 当前组件的虚拟节点上
    initialVNode.el = subTree.el
}

// 处理 fragment
function processFragment(vnode: any, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
    mountChildren(vnode, container, parentComponent)
}

// 处理 text
function processText(vnode: any, container: HTMLElement) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}
