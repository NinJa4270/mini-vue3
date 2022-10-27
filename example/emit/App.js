import { h } from '../../lib/mini-vue.esm.js'
import { Foo } from './Foo.js'

export const App = {
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