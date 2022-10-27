import { h } from '../../lib/mini-vue.esm.js'
export const Foo = {
    setup(props) {
        return {
            foo: 'Foo Component'
        }
    },
    render() {
        return h('div', { class: 'class-span' }, this.foo + ' : ' + this.count)
    }
}
