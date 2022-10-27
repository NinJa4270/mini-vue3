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
            [h("p", { class: 'class-p' }, "hello ! " + this.msg), h("span", { class: 'class-span' }, 'text'), h('button', {
                onClick() {
                    console.log('click')
                }
            }, 'click'), h('button', {
                onMousedown() {
                    console.log('onMousedown')
                }
            }, 'mouseDown')]
        )
    }
}