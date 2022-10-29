import { createApp, h, ref } from '../../dist/mini-vue.esm.js'


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

const ArrayToArray = {
    name: 'ArrayToArray',
    setup() {
        const isChange = ref(false)
        window.isChange = isChange
        return {
            isChange
        }
    },
    render() {
        const self = this
        /**
         * @description 左侧对比 demo
         *  old: (A B) C
         *  new: (A B) D E
         */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C")]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E")]

        /**
         * @description 右侧对比 demo
         * old: A (B C)
         * new: D E (B C)
         */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C")]
        // const nextChildren = [h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C")]

        /**
         * @description 左侧对比 新的比老的长 demo
         * old: A B
         * new: A B C D E
         */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"),]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"), h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E"),]

        /**
         * @description 右侧对比 新的比老的长 demo
         * old: B C
         * new: A D E B C
         */
        // const prevChildren = [h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"),]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"),]


        /**
         * @description 左侧对比 老的比新的长 demo
         * old: A B C D E
         * new: A B 
         */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"), h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E"),]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"),]



        /**
         * @description 右侧对比 老的比新的长 demo
         * old: A D E B C
         * new: B C
         */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "D" }, "D"), h('div', { key: "E" }, "E"), h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"),]
        // const nextChildren = [h('div', { key: "B" }, "B"), h('div', { key: "C" }, "C"),]


        /**
        * @description 中间对比 数量相等
        * old: A B C D F G
        * new: A B E C F G
        */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C", id: "prev-C" }, "C"), h('div', { key: "D" }, "D"), h('div', { key: "F" }, "F"), h('div', { key: "G" }, "G"),]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "E" }, "E"), h('div', { key: "C", id: "next-C" }, "C"), h('div', { key: "F" }, "F"), h('div', { key: "G" }, "G"),]


        /**
         * @description 中间对比 老的比新的剩余的多
         * old: A B C E D F G
         * new: A B E C F G
        */
        // const prevChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "C", id: "prev-C" }, "C"), h('div', { key: "E" }, "E"), h('div', { key: "D" }, "D"), h('div', { key: "F" }, "F"), h('div', { key: "G" }, "G"),]
        // const nextChildren = [h('div', { key: "A" }, "A"), h('div', { key: "B" }, "B"), h('div', { key: "E" }, "E"), h('div', { key: "C", id: "next-C" }, "C"), h('div', { key: "F" }, "F"), h('div', { key: "G" }, "G"),]


        /**
         * @description 中间对比 数量相等
         * old: (A B) C D E F G H I (T L)
         * new: (A B) E C D S H I K (T L)
         */
        const prevChildren = [
            h('div', { key: "A" }, "A"),
            h('div', { key: "B" }, "B"),
            h('div', { key: "C", id: 'old-C' }, "C"),
            h('div', { key: "D" }, "D"),
            h('div', { key: "E" }, "E"),
            h('div', { key: "F" }, "F"),
            h('div', { key: "G" }, "G"),
            h('div', { key: "H" }, "H"),
            h('div', { key: "I" }, "I"),
            h('div', { key: "T" }, "T"),
            h('div', { key: "L" }, "L"),
        ]
        const nextChildren = [
            h('div', { key: "A" }, "A"),
            h('div', { key: "B" }, "B"),
            h('div', { key: "E" }, "E"),
            h('div', { key: "C", id: 'new-C' }, "new C"),
            h('div', { key: "D" }, "D"),
            h('div', { key: "S" }, "S"),
            h('div', { key: "H" }, "H"),
            h('div', { key: "I" }, "I"),
            h('div', { key: "K" }, "K"),
            h('div', { key: "T" }, "T"),
            h('div', { key: "L" }, "L"),
        ]

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
            // h(TextToArray)
            h(ArrayToArray)
        ])
    }
}



const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)