import { h } from '../../lib/mini-vue.esm.js'

window.self = null

export const App = {

    setup() {
        return {
            msg: 'mini-vue3 !!!##'
        }
    },
    render() {
        window.self = this
        return h('div', { id: 'root', class: ['class-red', 'class-display'] },
            "hello ! " + this.msg
            // [h("p", { class: 'class-p' }, 'hi'), h("span", { class: 'class-span' }, 'mini-vue')]
        )
    }
}