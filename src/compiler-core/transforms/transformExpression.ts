import { InterpolationNode, NodeTypes, SimpleExpressionNode } from "../ast";
import { NodeTransform } from "../transform";

export const transformExpression: NodeTransform = (node, context) => {
    if (node.type === NodeTypes.INTERPOLATION) {
        (node as InterpolationNode).content = processExpression((node as InterpolationNode).content as SimpleExpressionNode)
    }
}

function processExpression(node: SimpleExpressionNode) {
    node.content = `_ctx.${node.content}`
    return node
}