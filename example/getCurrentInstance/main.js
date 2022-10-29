import { createApp, h, createTextVNode, getCurrentInstance } from '../../lib/mini-vue.esm.js'
const Foo = {
    name: 'Foo',
    setup(props) {
        const current = getCurrentInstance()
        console.log('%cFoo.js line:6 Foo', 'color: #007acc;', current);
        return {
            foo: 'Foo Component',
        }
    },
    render() {
        return h('div', { class: 'class-span' }, [createTextVNode('text 111'), h('div', {}, this.foo), createTextVNode('text 222')])
    }
}
const App = {
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

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)