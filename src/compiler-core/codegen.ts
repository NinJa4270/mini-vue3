import { InterpolationNode, JSChildNode, NodeTypes, RootNode, SimpleExpressionNode, TemplateChildNode, TextNode } from "./ast";
import { helperNameMap, TO_DISPLAY_STRING } from "./runtimeHelpers";

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
    push(`const { ${ast.helpers.map(aliasHelper).join(', ')} } = ${VueBinging}`)
    push(`\n`)
    push(`return`)
}


function genNode(node: CodegenNode, context: CodegenContext) {
    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node as TextNode, context)
            break
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node as SimpleExpressionNode, context)
            break
        case NodeTypes.INTERPOLATION:
            genInterpolation(node as InterpolationNode, context)
            break
    }
}

function genText(node: TextNode, context: CodegenContext) {
    const { push } = context
    push(` "${node.content}"`)
}

function genInterpolation(node: InterpolationNode, context: CodegenContext) {
    const { push, helper } = context
    push(` "${helper(TO_DISPLAY_STRING)}(`)
    genNode(node.content, context)
    push(`)`)
}

function genExpression(node: SimpleExpressionNode, context: CodegenContext) {
    const { content } = node
    const { push } = context
    push(content)
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