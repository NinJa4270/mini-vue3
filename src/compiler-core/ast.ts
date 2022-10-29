export const enum NodeTypes {
    ELEMENT,
    TEXT,
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ROOT
}

export interface Node {
    type: NodeTypes
}

export type ParentNode = RootNode | ElementNode

export interface BaseElementNode extends Node {
    tag: string,
    children: TemplateChildNode[]
}
export interface TextNode extends Node {
    type: NodeTypes.TEXT
    content: string
}

export type ElementNode = BaseElementNode
export interface RootNode {
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

export type TemplateChildNode = InterpolationNode | ElementNode | TextNode



export function createRoot(children: TemplateChildNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children,
    }
}