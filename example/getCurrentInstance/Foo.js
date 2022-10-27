
import { h, renderSlot, createTextVNode, getCurrentInstance } from '../../lib/mini-vue.esm.js'
export const Foo = {
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