
import { h, renderSlot } from '../../lib/mini-vue.esm.js'
export const Foo = {
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