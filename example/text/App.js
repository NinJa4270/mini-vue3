import { h, createTextVNode } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    setup() {
        return {
            app: "App Component"
        }
    },
    render() {
        const app = h('div', { class: 'class-p' }, this.app)
        const foo = h(Foo)
        return h('div', { id: 'root' },
            [createTextVNode('this is a text'), foo]
        )
    }
}