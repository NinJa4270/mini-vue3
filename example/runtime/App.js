import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'
window.self = null

export const App = {
    setup() {
        return {
            msg: 'mini-vue3 !!!##',
            count: 1001
        }
    },
    render() {
        window.self = this
        return h('div', { id: 'root' },
            [h('div', { class: 'class-p' }, this.msg), h('button', { onClick() { console.log(this) } }, 'click'), h(Foo, { count: this.count })]
        )
    }
}