import { createRoot, ElementNode, InterpolationNode, NodeTypes, TemplateChildNode } from "./ast";

export interface ParserContext {
    source: string
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context: ParserContext): TemplateChildNode[] {
    const nodes: TemplateChildNode[] = []
    const s = context.source
    let node: TemplateChildNode | undefined = undefined
    if (s.startsWith("{{")) {
        node = parseInterpolation(context)
    } else if (s[0] === '<') {
        if (/[a-z]/i.test(s[1])) {
            node = parseElement(context)
        }
    }
    if (node) {
        nodes.push(node)
    }
    return nodes
}

// 处理元素
function parseElement(context: ParserContext): ElementNode {
    // <div></div>
    // 解析tag
    const element = parseTag(context, TagType.Start)
    // 删除结束
    parseTag(context, TagType.End)
    
    return element
}


const enum TagType {
    Start,
    End
}
// 解析 tag  开始标签/结束标签
function parseTag(context: ParserContext, type: TagType.Start,): ElementNode
function parseTag(context: ParserContext, type: TagType.End): void
function parseTag(context: ParserContext, type: TagType): ElementNode | undefined {
    const match: any = /^<\/?([a-z]*)/i.exec(context.source) // 结束
    const tag = match[1]
    // 删除解析结果
    advanceBy(context, match[0].length) // <div
    advanceBy(context, 1) // >

    if (type === TagType.End) {
        return
    }
    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}

// 处理插值
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