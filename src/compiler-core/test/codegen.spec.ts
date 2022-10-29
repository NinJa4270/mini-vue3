import { expect, test, describe } from 'vitest'
import { generate } from '../codegen'
import { baseParse } from '../parse'
import { transform } from '../transform'
describe('codegen', () => {

    test('codegen', () => {
        const ast = baseParse("hi")
        transform(ast, {})
        const { code } = generate(ast)
        // 快照测试
        expect(code).matchSnapshot()
    })
})
