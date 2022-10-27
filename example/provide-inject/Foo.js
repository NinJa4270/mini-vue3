
import { h, inject } from '../../lib/mini-vue.esm.js'
import { Bar } from './Bar.js'

export const Foo = {
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