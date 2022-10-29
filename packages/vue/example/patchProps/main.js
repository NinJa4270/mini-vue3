import { createApp, h, ref } from '../../dist/mini-vue.esm.js'
const App = {
    setup() {

        const props = ref({
            foo: 'foo',
            bar: 'bar'
        })

        const changeProps1 = () => {
            props.value.foo = 'new foo'
        }

        const changeProps2 = () => {
            props.value.foo = undefined
        }

        const changeProps3 = () => {
            props.value = {
                foo: 'foo'
            }
        }

        return {
            props,
            changeProps1,
            changeProps2,
            changeProps3,
        }
    },
    render() {
        return h('div', { ...this.props },
            [
                h('button', {
                    onClick: this.changeProps1
                }, 'changeProps1'),
                h('button', {
                    onClick: this.changeProps2
                }, 'changeProps2'),
                h('button', {
                    onClick: this.changeProps3
                }, 'changeProps3')
            ])
    }
}



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)