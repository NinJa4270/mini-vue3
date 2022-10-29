import { isString } from "@ninja/shared";
import { CompoundExpressionNode, ElementNode, InterpolationNode, JSChildNode, NodeTypes, PlainElementNode, RootNode, SimpleExpressionNode, TemplateChildNode, TextNode } from "./ast";
import { CREATE_ELEMENT_VNODE, helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

interface CodegenContext {
    code: string
    helper(key: symbol): string
    push(code: string): void
}
type CodegenNode = TemplateChildNode | JSChildNode

const aliasHelper = (s: symbol) => `${helperNameMap[s]}: _${helperNameMap[s]}`

export function generate(ast: RootNode) {
    const context = createCodegenContext(ast)
    const { push } = context
    push(`\n`)

    genFunctionPreamble(ast, context)
    const functionName = "render"
    const args = ['_ctx', '_cache']
    const signature = args.join(', ')
    push(` function ${functionName}(${signature}) {`)
    push(`return `)

    if (ast.codegenNode) {
        genNode(ast.codegenNode, context)
    } else {
        push(`null`)
    }
    push(`}`)
    return {
        code: context.code
    }
}

function genFunctionPreamble(ast: RootNode, context: CodegenContext) {
    const VueBinging = `Vue`
    const { push } = context
    if (ast.helpers.length > 0) {
        push(
            `const { ${ast.helpers.map(aliasHelper).join(", ")}} = ${VueBinging} `
        );
    }
    push(`\n`)
    push(`return`)
}


function genNode(node: CodegenNode, context: CodegenContext) {
    if (!node) return
    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node as TextNode, context)
            break
        case NodeTypes.ELEMENT:
            genElement(node as PlainElementNode, context)
            break
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node as SimpleExpressionNode, context)
            break
        case NodeTypes.INTERPOLATION:
            genInterpolation(node as InterpolationNode, context)
            break
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node as CompoundExpressionNode, context)
            break
        default:
            break
    }
}

// 元素类型
function genElement(node: ElementNode, context: CodegenContext) {
    const { push, helper } = context
    const { tag, children, props } = node
    push(` ${helper(CREATE_ELEMENT_VNODE)}(`)
    genNodeList(genNullable([tag, props, children]), context)
    // genNode(children as unknown as CodegenNode, context)
    push(`)`)
}

function genNodeList(nodes: unknown[], context: CodegenContext) {
    const { push } = context
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (isString(node)) {
            push(`${node}`)
        } else {
            genNode(node as CodegenNode, context)
        }

        if (i < nodes.length - 1) {
            push(", ")
        }
    }
}

function genNullable(args: unknown[]) {
    return args.map(arg => arg || "null")
}

// 文字类型
function genText(node: TextNode, context: CodegenContext) {
    const { push } = context
    push(` "${node.content}"`)
}

// 插值类型
function genInterpolation(node: InterpolationNode, context: CodegenContext) {
    const { push, helper } = context
    push(` ${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(`)`)
}

// 插值内表达式类型
function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
    const { content } = node
    const { push } = context
    push(content)
}
// 复合类型
function genCompoundExpression(node: CompoundExpressionNode, context: CodegenContext) {
    const { push } = context
    const { children } = node
    for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (isString(child)) {
            push(child)
        } else {
            genNode(child, context)
        }
    }
}

function createCodegenContext(ast: RootNode): CodegenContext {
    const context: CodegenContext = {
        code: ``,
        push(code) {
            context.code += code
        },
        helper(key) {
            return `_${helperNameMap[key]}`
        },
    }
    return context
}