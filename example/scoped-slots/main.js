import { createApp, renderSlot, h } from '../../lib/mini-vue.esm.js'
const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component',
            age: 20
        }
    },
    render() {
        // 作用域插槽
        return h('div', { class: 'class-span' }, [renderSlot(this.$slots, 'header', {
            age: 20
        }), h('div', {}, 'Foo'), renderSlot(this.$slots, 'footer', {
            count: 30
        })])
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
        const slot1 = ({ age }) => h("p", {}, 'slot header ' + age)
        const slot2 = ({ count }) => h("span", {}, 'slot footer ' + count)
        const foo = h(Foo, {}, {
            header: slot1,
            footer: slot2
        })
        return h('div', { id: 'root' },
            [app, foo]
        )
    }
}

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)