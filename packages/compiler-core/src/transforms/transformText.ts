import { CompoundExpressionNode, InterpolationNode, NodeTypes, TextNode } from "../ast";
import { NodeTransform } from "../transform";
import { isText } from "../utils";

export const transformText: NodeTransform = (node, context) => {
    return () => {
        if (node.type === NodeTypes.ELEMENT) {
            const children = node.children
            let currentContainer: CompoundExpressionNode | undefined = undefined
            for (let i = 0; i < children.length; i++) {
                const child = children[i]
                // 判断是否是 text类型或 插值类型
                if (isText(child)) {
                    // 查找他下一个节点是否需要联合
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j]
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: NodeTypes.COMPOUND_EXPRESSION,
                                    children: [child as TextNode | InterpolationNode]
                                }
                            }
                            currentContainer.children.push(` + `, next as TextNode | InterpolationNode)
                            children.splice(j, 1) // 删除
                            j-- // 继续遍历
                        } else {
                            currentContainer = undefined
                            break
                        }
                    }
                }
            }
        }
    }
}
