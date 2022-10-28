import { createRoot, InterpolationNode, NodeTypes, TemplateChildNode } from "./ast";

export interface ParserContext {
    source: string
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context: ParserContext): TemplateChildNode[] {
    const nodes: TemplateChildNode[] = []
    let node: TemplateChildNode
    if (context.source.startsWith("{{")) {
        node = parseInterpolation(context)
    }
    nodes.push(node)
    return nodes
}

function parseInterpolation(context: ParserContext): InterpolationNode {
    // {{  message}}
    // delimiters
    const open = "{{"
    const close = "}}"

    const closeIndex = context.source.indexOf(close, open.length)
    advanceBy(context, open.length)

    const rawContentLength = closeIndex - open.length
    const rawContent = context.source.slice(0, rawContentLength)
    const content = rawContent.trim()
    advanceBy(context, rawContentLength)

    advanceBy(context, close.length)

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content
        }
    }
}

function advanceBy(context: ParserContext, numberOfCharacters: number): void {
    const { source } = context
    context.source = source.slice(numberOfCharacters)
}


function createParserContext(content: string): ParserContext {
    return {
        source: content
    }
}