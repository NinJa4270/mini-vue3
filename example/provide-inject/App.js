import { h, provide } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
    name: 'App',
    setup() {

        provide("foo", "fooval")
        provide("bar", "barVal")

        return {
            app: 'App '
        }
    },
    render() {
        const app = h('div', { class: 'class-p' }, this.app)
        const foo = h(Foo)
        return h('div', { id: 'root' }, [app, foo])
    }
}