import { createApp, ref } from '../../lib/mini-vue.esm.js'

const App = {
    name: 'App',
    template: `<div>hi, {{count}} - {{message}}</div>`,
    setup() {
        const count = window.count = ref(1)
        return {
            count,
            message: "mini-vue"
        }
    },
}

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)