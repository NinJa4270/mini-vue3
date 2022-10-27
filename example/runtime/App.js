import { h } from '../../lib/mini-vue.esm.js'

export const App = {

    setup() {
        return {
            mas: 'mini-vue3'
        }
    },
    render() {
        return h('div', { id: 'root', class: ['class-red', 'class-display'] },
            // "hello" + this.msg
            [h("p", { class: 'class-p' }, 'hi'), h("span", { class: 'class-span' }, 'mini-vue')]
        )
    }
}