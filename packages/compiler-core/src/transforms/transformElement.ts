import { createVNodeCall, NodeTypes, TemplateTextChildNode } from "../ast"
import { NodeTransform } from "../transform"

export const transformElement: NodeTransform = (node, context) => {
    return () => {
        if (node.type === NodeTypes.ELEMENT) {
            const { tag, children, props } = node
            // tag
            let vnodeTag = `'${tag}'`
            // pros
            let vnodeProps = props
            let vnodeChildren = children[0] as TemplateTextChildNode
            node.codegenNode = createVNodeCall(context, vnodeTag, props, vnodeChildren)
        }
    }
}