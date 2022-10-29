import { expect, test, describe } from 'vitest'
import { NodeTypes } from '../ast'
import { baseParse } from '../parse'
import { transform } from '../transform'
describe('transform', () => {

    test('transform', () => {
        const ast: any = baseParse("<div>h1,{{ message }}</div>")

        const plugin = (node: any) => {
            if (node.type === NodeTypes.TEXT) {
                node.content += "mini-vue"
            }
        }

        transform(ast, { nodeTransforms: [plugin] })
        const nodeText = ast.children[0].children[0]
        expect(nodeText.content).toBe('h1,mini-vue')
    })
})