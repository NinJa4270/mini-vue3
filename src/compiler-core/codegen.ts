import { RootNode, TextNode } from "./ast";

interface CodegenContext {
    code: string
    push(code: string): void
}

export function generate(ast: RootNode) {
    const context = createCodegenContext(ast)
    const { push } = context
    push(`return`)
    const functionName = "render"
    const args = ['_ctx', '_cache']
    const signature = args.join(', ')
    push(` function ${functionName}(${signature}) {`)
    push(`return `)
    genCode(ast.codegenNode as TextNode, context)
    push(`}`)
    return {
        code: context.code
    }
}

function genCode(codegenNode: TextNode, context: CodegenContext) {
    context.code += ` "${codegenNode.content}"`
}

function createCodegenContext(ast: RootNode): CodegenContext {
    const context = {
        code: ``,
        push(code: string) {
            context.code += code
        }
    }
    return context
}