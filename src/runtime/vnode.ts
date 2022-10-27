import { isString } from "../shared"
import { ShapeFlags } from "../shared/shapeFlags";

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

    return vnode
}