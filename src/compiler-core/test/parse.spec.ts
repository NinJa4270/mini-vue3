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
            tag: "div",
            children: []
        })
    })

    test('text', () => {
        const ast = baseParse("text value")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.TEXT,
            content: "text value"
        })
    })


    test('combination ast', () => {
        const ast = baseParse("<p>h1, {{ message }}</p>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "p",
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: "h1, "
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                }
            ]
        })
    })

    test('combination nested ast 1', () => {
        const ast = baseParse("<div><p>h1,</p>{{ message }}</div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "h1,"
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                },
            ]
        })
    })

    test('lack close tag', () => {
        // 必须包裹在函数里 否则无法捕获错误
        // https://cn.vitest.dev/api/#tothrowerror
        expect(() => baseParse("<div><span></div>")).toThrowError('Element is missing end tag. span')
    })

    test('combination nested ast 2', () => {
        const ast = baseParse("<div>h1, <p>nested ast</p>{{ message }}</div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: "h1, "
                },
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "nested ast"
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                },
            ]
        })
    })

    test.only('combination nested ast 3', () => {
        const ast = baseParse("<div>h1, <p>nested ast</p>{{ message }}<span>{{test}}</span></div>")
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: "div",
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: "h1, "
                },
                {
                    type: NodeTypes.ELEMENT,
                    tag: "p",
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: "nested ast"
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: "message"
                    }
                },
                {
                    type: NodeTypes.ELEMENT,
                    tag: "span",
                    children: [
                        {
                            type: NodeTypes.INTERPOLATION,
                            content: {
                                type: NodeTypes.SIMPLE_EXPRESSION,
                                content: "test"
                            }
                        }
                    ]
                }
            ]
        })
    })
})