
import { h, renderSlot } from '../../lib/mini-vue.esm.js'
export const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component',
        }
    },
    render() {
        return h('div', { class: 'class-span' }, [renderSlot(this.$slots, 'header'), h('div', {}, this.foo), renderSlot(this.$slots, 'footer')])
    }
}