import { h } from '../../lib/mini-vue.esm.js'

export const App = {

    setup() {
        return {
            mas: 'mini-vue3'
        }
    },
    render() {
        return h('div', "hello" + this.msg)
    }
}