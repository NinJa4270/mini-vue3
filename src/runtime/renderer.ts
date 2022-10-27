import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container)
}

function patch(vnode: any, container: any) {
    console.log('%crenderer.ts line:9 vnode.type', 'color: #007acc;', vnode.type);
    // 判断处理
    if (typeof vnode.type === 'string') {
        processElement(vnode, container)
    } else if (isObject(vnode.type)) {
        processComponent(vnode, container)

    }

}
function processElement(vnode: any, container: any) {
    // init 
    mountElement(vnode, container)
    // update
}
function mountElement(vnode: any, container: any) {
    const el = document.createElement(vnode.type)
    const { children, props } = vnode
    if (Array.isArray(children)) {
        mountChildren(vnode, el)
    } else if (typeof children === 'string') {
        el.textContent = children
    }
    for (let key in props) {
        const prop = props[key]
        el.setAttribute(key, prop)
    }
    container.append(el)
}

function mountChildren(vnode: any, container: any) {
    vnode.children.forEach((v: any) => {
        patch(v, container)
    })
}


function processComponent(vnode: any, container: any) {
    mountComponent(vnode, container)
}

function mountComponent(vnode: any, container: any) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}
function setupRenderEffect(instance: any, container: any) {
    const subTree = instance.render()

    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container)
}

