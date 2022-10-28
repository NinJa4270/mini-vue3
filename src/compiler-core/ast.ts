export const enum NodeTypes {
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ROOT
}

export interface Node {
    type: NodeTypes
}

interface RootNode {
    type: NodeTypes.ROOT,
    children: TemplateChildNode[]
}

export interface SimpleExpressionNode extends Node {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string
}

export type ExpressionNode = SimpleExpressionNode

export interface InterpolationNode extends Node {
    type: NodeTypes.INTERPOLATION
    content: ExpressionNode
}

export type TemplateChildNode = InterpolationNode



export function createRoot(children: TemplateChildNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children,
    }
}