import { createApp, h, ref, getCurrentInstance, nextTick } from '../../dist/mini-vue.esm.js'
const App = {
    setup() {
        const count = ref(1)
        const instance = getCurrentInstance()
        const click = () => {
            for (let i = 0; i < 100; i++) {
                count.value++
            }
            console.log('%cmain.js line:11 instance', 'color: #007acc;', instance);
            // debugger
            nextTick(() => {
                console.log('%cmain.js line:11 instance', 'color: #007acc;', instance);
                // debugger
            })
        }
        return {
            count,
            click
        }
    },
    render() {
        const button = h('button', {
            onClick: this.click
        }, 'start')
        const p = h('p', {}, "count: " + this.count)
        return h('div', {}, [button, p])
    }
}



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)