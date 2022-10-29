import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers"
import { NodeTransform } from "../transform"

export const transformElement: NodeTransform = (node, context) => {
    context.helper(CREATE_ELEMENT_VNODE)
}