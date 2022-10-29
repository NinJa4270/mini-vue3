import { createApp, h, ref } from '../../dist/mini-vue.esm.js'
const App = {
    setup() {
        const count = ref(0)
        const add = () => {
            count.value++
        }
        return {
            count,
            add
        }
    },
    render() {
        return h('div', { class: 'class-p' }, [h('div', {}, '依赖 count：' + this.count), h('button', { onClick: this.add }, 'add')])
    }
}



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)