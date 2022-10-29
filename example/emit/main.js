import { createApp, h } from '../../lib/mini-vue.esm.js'
const Foo = {
    setup(props, { emit }) {
        const edmitAdd = () => {
            emit('add', 1, 2, 3)
            emit('add-foo')
        }
        return {
            foo: 'Foo Component',
            edmitAdd
        }
    },
    render() {
        const btn = h('button', {
            onClick: this.edmitAdd
        }, 'emitadd')
        return h('div', { class: 'class-span' }, [h('div', {}, this.foo + ' : ' + this.count), btn])
    }
}
const App = {
    setup() {

        const onAdd = (a, b, c) => {
            console.log('App - onAdd')
            console.log('value: ', a, b, c)

        }
        return {
            msg: 'mini-vue3 !!!##',
            count: 100,
            onAdd
        }
    },
    render() {
        const _Foo = h(Foo, {
            count: this.count, onAdd: this.onAdd, onAddFoo() { console.log('App - addFoo') }
        })
        return h('div', { id: 'root' },
            [h('div', { class: 'class-p' }, this.msg + ':' + this.count), _Foo]
        )
    }
}

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)