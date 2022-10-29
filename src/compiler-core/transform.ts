import { NodeTypes, RootNode, TemplateChildNode, ParentNode } from "./ast";


export type NodeTransform = (node: RootNode | TemplateChildNode) => void | (() => void) | (() => void)[]

interface TransformOptions {
    nodeTransforms?: NodeTransform[]
}


export function transform(root: RootNode, options: TransformOptions) {
    const context = createTransformContext(root, options)
    // 遍历 - 深度优先
    traverseNode(root, context)

    createRootCodegen(root)

}

function createRootCodegen(root: RootNode) {
    root.codegenNode = root.children[0]
}

function traverseNode(node: RootNode | TemplateChildNode, context: TransformContext) {
    const { nodeTransforms } = context
    // 修改值
    for (let i = 0; i < nodeTransforms.length; i++) {
        nodeTransforms[i](node)
    }
    if (node.type === NodeTypes.ROOT || node.type === NodeTypes.ELEMENT) {
        traverseChildren(node, context)
    }
}

function traverseChildren(parent: ParentNode, context: TransformContext) {
    const children = parent.children
    if (children) {
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i]
            traverseNode(child, context)
        }
    }
}

interface TransformContext {
    nodeTransforms: NodeTransform[]
}

function createTransformContext(root: RootNode, { nodeTransforms = [], }: TransformOptions): TransformContext {
    const context: TransformContext = {
        nodeTransforms,
    }
    return context
}