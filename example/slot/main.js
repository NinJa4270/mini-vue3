import { createApp, h, renderSlot } from '../../lib/mini-vue.esm.js'
const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component',
        }
    },
    render() {
        return h('div', { class: 'class-span' }, [renderSlot(this.$slots, 'header'), h('div', {}, this.foo), renderSlot(this.$slots, 'footer')])
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
        const slot1 = h("p", {}, 'slot header')
        const slot2 = h("span", {}, 'slot footer')
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