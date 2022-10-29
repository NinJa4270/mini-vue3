import { createRoot, ElementNode, InterpolationNode, NodeTypes, TemplateChildNode, TextNode } from "./ast";

export interface ParserContext {
    source: string
}

export function baseParse(content: string) {
    const context = createParserContext(content)
    return createRoot(parseChildren(context, []))
}

function parseChildren(context: ParserContext, ancestors: ElementNode[]): TemplateChildNode[] {
    const nodes: TemplateChildNode[] = []
    while (!isEnd(context, ancestors)) {
        const s = context.source
        let node: TemplateChildNode | undefined = undefined
        if (startsWith(s, '{{')) {
            node = parseInterpolation(context)
        } else if (s[0] === '<') {
            if (/[a-z]/i.test(s[1])) {
                node = parseElement(context, ancestors)
            }
        }
        if (!node) {
            node = parseText(context)
        }
        nodes.push(node)
    }

    return nodes
}

function parseText(context: ParserContext): TextNode {
    const endTokens = ['{{', '<']
    let endIndex = context.source.length

    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i])
        if (index !== -1 && endIndex > index) {
            endIndex = index
        }
    }
    const content = parseTextData(context, endIndex)
    return {
        type: NodeTypes.TEXT,
        content,
    }
}

function parseTextData(context: ParserContext, length: number) {
    const content = context.source.slice(0, length)
    advanceBy(context, length)
    return content
}

// 处理元素
function parseElement(context: ParserContext, ancestors: ElementNode[]): ElementNode {
    // <div></div>
    // 解析tag
    const element = parseTag(context, TagType.Start)
    ancestors.push(element) // 收集tag栈
    const children = parseChildren(context, ancestors)
    element.children = children
    ancestors.pop() // 弹出tag栈

    // 相同
    if (startsWithEndTagOpen(context.source, element.tag)) {
        // 删除结束
        parseTag(context, TagType.End)
    } else {
        throw new Error(`Element is missing end tag. ${element.tag}`)
    }
    return element
}

// 当前children 是否结束
function isEnd(context: ParserContext, ancestors: ElementNode[]) {
    const s = context.source
    // 遇到结束标签
    // if (parentTag && s.startsWith(`</${parentTag}>`)) {
    //     return true
    // }
    if (startsWith(s, '</')) {
        for (let i = ancestors.length - 1; i >= 0; i--) { 
            const tag = ancestors[i].tag
            // </div>
            if (startsWithEndTagOpen(s, tag)) {
                return true
            }
        }
    }
    // source 没有值 结束 
    return !s
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
        tag,
        children: []
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
    // const rawContent = context.source.slice(0, rawContentLength)
    const rawContent = parseTextData(context, rawContentLength)
    const content = rawContent.trim()

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

function startsWithEndTagOpen(source: string, tag: string) {
    return startsWith(source, '<') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function startsWith(source: string, searchString: string): boolean {
    return source.startsWith(searchString)
}