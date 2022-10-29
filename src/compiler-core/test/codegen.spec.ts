import { expect, test, describe } from 'vitest'
import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'
import { transformElement } from '../transforms/transformElement'
import { transformExpression } from '../transforms/transformExpression'
describe('codegen', () => {

    test('codegen text', () => {
        const ast = baseParse("hi")
        transform(ast, {})
        const { code } = generate(ast)
        // 快照测试
        expect(code).matchSnapshot()
    })

    test('codegen interpolation', () => {
        const ast = baseParse("{{message}}")
        transform(ast, {
            nodeTransforms: [transformExpression]
        })
        const { code } = generate(ast)
        // 快照测试
        expect(code).matchSnapshot()
    })


    test('codegen element', () => {
        const ast = baseParse("<div></div>")
        transform(ast, {
            nodeTransforms: [transformElement]
        })
        const { code } = generate(ast)
        // 快照测试
        expect(code).matchSnapshot()
    })
})
