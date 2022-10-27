import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    setup() {
        return {
            app: "App Component"
        }
    },
    render() {
        const app = h('div', { class: 'class-p' }, this.app)
        const slot1 = h("p", {}, 'slot header')
        const slot2 = h("span", {}, 'slot footer')
        const foo = h(Foo, {}, {
            header: slot1,
            footer: slot2
        })
        return h('div', { id: 'root' },
            [app, foo]
        )
    }
}