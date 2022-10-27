
import { h, inject } from '../../lib/mini-vue.esm.js'
export const Bar = {
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