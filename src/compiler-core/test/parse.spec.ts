import { expect, test, describe } from 'vitest'
import { NodeTypes } from '../ast'
import { baseParse } from '../parse'
describe('parse', () => {
    test('interpolation', () => {

        const ast = baseParse("{{  message}}")

        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.INTERPOLATION,
            content: {
                type: NodeTypes.SIMPLE_EXPRESSION,
                content: "message"
            }
        })

    })

    test('element', () => {
        const ast = baseParse("<div></div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div"
        })
    })

    test('text', () => {
        const ast = baseParse("text value")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.TEXT,
            content: "text value"
        })
    })
})