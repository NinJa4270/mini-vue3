export const enum NodeTypes {
    ELEMENT,
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ROOT
}

export interface Node {
    type: NodeTypes
}

export interface BaseElementNode extends Node {
    tag: string
}

export type ElementNode = BaseElementNode
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

export type TemplateChildNode = InterpolationNode | ElementNode



export function createRoot(children: TemplateChildNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children,
    }
}