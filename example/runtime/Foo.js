import { h } from '../../lib/mini-vue.esm.js'
export const Foo = {
    setup(props) {
        console.log('%cFoo.js line:4 props', 'color: #007acc;', props);
        props.count++
        return {
            foo: 'Foo Component'
        }
    },
    render() {
        return h('div', { class: 'class-span' }, this.foo + ' : ' + this.count)
    }
}