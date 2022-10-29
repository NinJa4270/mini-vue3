import { createApp, h, createTextVNode } from '../../dist/mini-vue.esm.js'
const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component',
        }
    },
    render() {

        return h('div', { class: 'class-span' }, [createTextVNode('text 111'), h('div', {}, this.foo), createTextVNode('text 222')])
    }
}

const App = {
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



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)