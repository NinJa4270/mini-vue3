import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component"
import { Fragment, Text } from "./vnode";

export function render(vnode: any, container: HTMLElement) {
    // patch
    patch(vnode, container)
}

function patch(vnode: any, container: HTMLElement) {
    // 判断处理
    const { type, shapeFlag } = vnode

    // 需要特殊处理的 type 
    switch (type) {
        case Fragment:
            processFragment(vnode, container)
            break
        case Text:
            processText(vnode, container)
            break
        default:
            if (shapeFlag & ShapeFlags.ELEMENT) {
                processElement(vnode, container)
            } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                processComponent(vnode, container)
            }
            break
    }

}

// 处理 element
function processElement(vnode: any, container: HTMLElement) {
    // init 
    mountElement(vnode, container)
    // update
}
function mountElement(vnode: any, container: HTMLElement) {
    // 存到 vnode 上
    const el: HTMLElement = (vnode.el = document.createElement(vnode.type))
    const { children, props, shapeFlag } = vnode

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(vnode, el)
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

function mountChildren(vnode: any, container: HTMLElement) {
    vnode.children.forEach((v: any) => {
        patch(v, container)
    })
}

// 处理 component
function processComponent(vnode: any, container: HTMLElement) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container: HTMLElement) {
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container)

    // 组件的 所有的 element 都处理完毕
    // 将根节点的el 赋值到 当前组件的虚拟节点上
    initialVNode.el = subTree.el
}

// 处理 fragment
function processFragment(vnode: any, container: HTMLElement) {
    mountChildren(vnode, container)
}

// 处理 text
function processText(vnode: any, container: HTMLElement) {
    const { children } = vnode
    const textNode = (vnode.el = document.createTextNode(children))
    container.append(textNode)
}
