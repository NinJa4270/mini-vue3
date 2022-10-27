import { isString } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVNode(type: any, props?: any, children?: any) {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
    const vnode = {
        type,
        props,
        children,
        el: null,
        shapeFlag
    }

    if (children) {
        vnode.shapeFlag |= isString(children)
            ? ShapeFlags.TEXT_CHILDREN
            : ShapeFlags.ARRAY_CHILDREN
    }

    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
        }
    }

    return vnode
}

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text)
}