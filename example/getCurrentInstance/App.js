import { h, createTextVNode, getCurrentInstance } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    setup() {
        const current = getCurrentInstance()
        console.log('%cApp.js line:8 App', 'color: #007acc;', current);
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