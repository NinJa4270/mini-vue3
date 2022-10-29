import { NodeTypes, RootNode, TemplateChildNode, ParentNode } from "./ast";
import { TO_DISPLAY_STRING } from "./runtimeHelpers";


export type NodeTransform = (node: RootNode | TemplateChildNode, context: TransformContext) => void | (() => void) | (() => void)[]

interface TransformOptions {
    nodeTransforms?: NodeTransform[]
}

export function transform(root: RootNode, options: TransformOptions) {
    const context = createTransformContext(root, options)
    // 遍历 - 深度优先
    traverseNode(root, context)

    createRootCodegen(root)

    root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root: RootNode) {
    const child = root.children[0]
    if (child.type === NodeTypes.ELEMENT) {
        root.codegenNode = child.codegenNode
    } else {
        root.codegenNode = root.children[0]
    }
}

function traverseNode(node: RootNode | TemplateChildNode, context: TransformContext) {
    const { nodeTransforms } = context
    // 修改值
    const exitFns: any = [] // 退出时 需要执行的插件
    for (let i = 0; i < nodeTransforms.length; i++) {
        const onExit = nodeTransforms[i](node, context)
        if (onExit) exitFns.push(onExit)
    }
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING)
            break
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            // context.helper(CREATE_ELEMENT_BLOCK)
            traverseChildren(node, context)
            break
    }

    let i = exitFns.length
    while (i--) {
        exitFns[i]()
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

export interface TransformContext {
    nodeTransforms: NodeTransform[],
    helpers: Map<symbol, number>
    helper<T extends symbol>(name: T): T
}

function createTransformContext(root: RootNode, { nodeTransforms = [] }: TransformOptions): TransformContext {
    const context: TransformContext = {
        nodeTransforms,
        helpers: new Map(),
        helper(name) {
            const count = context.helpers.get(name) || 0
            context.helpers.set(name, count + 1)
            return name
        },
    }
    return context
}