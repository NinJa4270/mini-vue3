import { CREATE_ELEMENT_VNODE } from "./runtimeHelpers"
import { TransformContext } from "./transform"

export const enum NodeTypes {
    ELEMENT,
    TEXT,
    INTERPOLATION,
    SIMPLE_EXPRESSION,
    ROOT,
    COMPOUND_EXPRESSION,
    VNODE_CALL
}

export interface Node {
    type: NodeTypes
}

export type ParentNode = RootNode | ElementNode

export interface BaseElementNode extends Node {
    tag: string,
    children: TemplateChildNode[],
    props: any
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
    codegenNode: SimpleExpressionNode | VNodeCall | undefined
}

export interface RootNode {
    type: NodeTypes.ROOT,
    children: TemplateChildNode[]
    codegenNode?: TemplateChildNode | JSChildNode
    helpers: symbol[]
}

export interface SimpleExpressionNode extends Node {
    type: NodeTypes.SIMPLE_EXPRESSION
    content: string
}

export type ExpressionNode = SimpleExpressionNode | CompoundExpressionNode

export interface InterpolationNode extends Node {
    type: NodeTypes.INTERPOLATION
    content: ExpressionNode
}

export type TemplateChildNode = InterpolationNode | ElementNode | TextNode | CompoundExpressionNode

export type JSChildNode = ExpressionNode | VNodeCall


export interface CompoundExpressionNode extends Node {
    type: NodeTypes.COMPOUND_EXPRESSION
    children: (
        | SimpleExpressionNode
        | CompoundExpressionNode
        | InterpolationNode
        | TextNode
        | string
    )[]
}


export function createRoot(children: TemplateChildNode[]): RootNode {
    return {
        type: NodeTypes.ROOT,
        children,
        helpers: [],
    }
}

export type TemplateTextChildNode =
    | TextNode
    | InterpolationNode
    | CompoundExpressionNode

export interface VNodeCall extends Node {
    // type: NodeTypes.VNODE_CALL
    type: NodeTypes.ELEMENT
    tag: string
    props: any
    children: TemplateChildNode[] | TemplateTextChildNode | SimpleExpressionNode | undefined
}

export function createVNodeCall(
    context: TransformContext | null,
    tag: VNodeCall['tag'],
    props?: VNodeCall['props'],
    children?: VNodeCall['children']
): VNodeCall {
    if (context) {
        context.helper(CREATE_ELEMENT_VNODE)
    }
    return {
        type: NodeTypes.ELEMENT,
        tag,
        children,
        props
    }
}

