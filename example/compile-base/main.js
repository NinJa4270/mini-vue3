import { createApp, ref } from '../../lib/mini-vue.esm.js'

const App = {
    name: 'App',
    template: `<div>hi, {{message}}</div>`,
    setup() {
        return {
            message: "min-vue"
        }
    },
}

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)