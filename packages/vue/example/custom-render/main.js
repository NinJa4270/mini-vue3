import { createRenderer, h, createTextVNode } from '../../dist/mini-vue.esm.js'

console.log('%cmain.js line:3 PIXI', 'color: #007acc;', PIXI);

const game = new PIXI.Application({
    width: 400,
    height: 600
})

document.body.append(game.view)

const App = {
    setup() {
        return {
            x: 100,
            y: 199
        }
    },
    render() {
        return h("rect", { x: this.x, y: this.y })
    }
}

const renderer = createRenderer({
    createElement(type) {
        if (type === 'rect') {
            const rect = new PIXI.Graphics()
            rect.beginFill(0xFF0000)
            rect.drawRect(0, 0, 100, 100)
            rect.endFill()
            return rect
        }
    },
    patchProp(el, key, prop) {
        el[key] = prop
    },
    insert(el, container) {
        container.addChild(el)
    },
})


renderer.createApp(App).mount(game.stage)


// const rootContainer = document.querySelector('#app')
// createApp(App).mount(rootContainer)