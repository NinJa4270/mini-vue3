
import { h } from '../../lib/mini-vue.esm.js'
export const Foo = {
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