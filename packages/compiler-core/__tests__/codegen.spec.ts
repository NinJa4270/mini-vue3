import { expect, test, describe } from 'vitest'
import { generate } from '../src/codegen'
import { baseParse } from '../src/parse'
import { transform } from '../src/transform'
import { transformElement } from '../src/transforms/transformElement'
import { transformExpression } from '../src/transforms/transformExpression'
import { transformText } from '../src/transforms/transformText'
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

    test('codegen combination', () => {
        const ast = baseParse("<div>hi, {{message}}</div>")
        transform(ast, {
            nodeTransforms: [transformExpression, transformElement, transformText]
        })
        const { code } = generate(ast)
        // 快照测试
        expect(code).matchSnapshot()
    })
})
