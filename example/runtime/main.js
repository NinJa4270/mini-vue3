import { createApp, h } from '../../lib/mini-vue.esm.js'
const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component'
        }
    },
    render() {
        return h('div', { class: 'class-span' }, this.foo + ' : ' + this.count)
    }
}
window.self = null
const App = {
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

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)