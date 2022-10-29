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

export interface SimpleExpressionNode extends Node {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string
}

export type ElementNode = PlainElementNode

export const enum ElementTypes {
    ELEMENT,
}

export interface PlainElementNode extends BaseElementNode {
    tagType: ElementTypes.ELEMENT
    codegenNode: SimpleExpressionNode | undefined
}

export interface RootNode {
    type: NodeTypes.ROOT,
    children: TemplateChildNode[]
    codegenNode?: TemplateChildNode
    helpers: symbol[]
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

export type JSChildNode = ExpressionNode


export function createRoot(children: TemplateChildNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children,
        helpers: [],
    }
}