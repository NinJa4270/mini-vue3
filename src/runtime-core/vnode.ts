import { isString } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export type VNodeTypes =
    | string
    | VNode
    | typeof Text
    | typeof Comment
    | typeof Fragment
export interface VNode {
    type: VNodeTypes
    props: any
    children: VNode[] | string
    el: HTMLElement | Text | null
    shapeFlag: number
}


export function createVNode(type: VNodeTypes, props?: any, children?: any) {
    const shapeFlag = isString(type) ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT
    const vnode: VNode = {
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