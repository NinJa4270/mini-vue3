import { createApp, provide, h, inject } from '../../dist/mini-vue.esm.js'

const Bar = {
    name: 'Bar',
    setup(props) {
        const foo = inject("foo")
        const bar = inject("bar")
        const baz = inject("baz", 'defalut value')
        const ttt = inject("baz", () => 'ttt defalut value')

        return {
            foo,
            bar,
            baz,
            ttt
        }
    },
    render() {
        return h('div', { class: 'class-span' }, 'Bar: ' + this.foo + ' - ' + this.bar + '- ' + this.baz + '- ' + this.ttt)
    }
}
const Foo = {
    name: 'Foo',
    setup(props) {
        const foo = inject("foo")
        const bar = inject("bar")

        return {
            foo,
            bar
        }
    },
    render() {
        const bar = h(Bar)
        const foo = h('div', { class: 'class-p' }, 'Foo :' + this.foo + ' - ' + this.bar)
        return h('div', { class: 'class-span' }, [foo, bar])
    }
}

const App = {
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

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)