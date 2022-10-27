import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, container: HTMLElement) {
    // patch
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    // 判断处理
    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container)
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container)
    }

}
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


function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(initialVNode: any, container: any) {
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}
function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    console.log('%crenderer.ts line:58 instance', 'color: #007acc;', instance);
    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container)

    // 组件的 所有的 element 都处理完毕
    // 将根节点的el 赋值到 当前组件的虚拟节点上
    initialVNode.el = subTree.el
}

