import { createApp, h, ref } from '../../lib/mini-vue.esm.js'

const Child = {
    name: "Child",
    setup() {

    },
    render() {
        return h("div", {}, [h("div", {}, "child - props - msg" + this.$props.msg)])
    }
}

const App = {
    name: 'App',
    setup() {
        const msg = ref(123)
        const count = ref(1)
        window.msg = msg
        const changeChildProps = () => {
            msg.value++
        }
        const changeCount = () => {
            count.value++
        }

        return {
            msg,
            count,
            changeChildProps,
            changeCount
        }
    },
    render() {
        return h('div', {}, [
            h('div', {}, "你好"),
            h("button", {
                onClick: this.changeChildProps
            },
                "change child props"
            ),
            h(Child, {
                msg: this.msg
            }),
            h('button', {
                onClick: this.changeCount
            },
                "change count"
            ),
            h("p", {}, "count: " + this.count)
        ])
    }
}

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)