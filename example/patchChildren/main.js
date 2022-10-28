import { createApp, h, ref } from '../../lib/mini-vue.esm.js'


const ArrayToText = {
    name: 'ArrayToText',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this
        const nextChildren = "newChildren"
        const prevChildren = [h('div', {}, "A"), h('div', {}, "B")]
        return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
    }
}

const TextToText = {
    name: 'TextToText',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this
        const nextChildren = "newChildren"
        const prevChildren = "oldChildren"
        return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
    }
}

const TextToArray = {
    name: 'TextToArray',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this
        const nextChildren = [h('div', {}, "A"), h('div', {}, "B")]
        const prevChildren = "oldChildren"
        return self.isChange === true ? h('div', {}, nextChildren) : h('div', {}, prevChildren)
    }
}



const App = {
    setup() {

    },
    render() {
        return h('div', {}, [
            h('p', {}, '首页'),
            // h(ArrayToText)
            // h(TextToText)
            h(TextToArray)
        ])
    }
}



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)