
import { h, renderSlot, createTextVNode } from '../../lib/mini-vue.esm.js'
export const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component',
        }
    },
    render() {

        return h('div', { class: 'class-span' }, [createTextVNode('text 111'), h('div', {}, this.foo), createTextVNode('text 222')])
    }
}