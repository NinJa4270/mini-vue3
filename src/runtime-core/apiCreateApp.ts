import { createVNode } from "./vnode"


export function createAppAPI(render: any) {
    return function createApp(rootComponent: any) {
        return {
            mount(rootContainer: any) {
                // component => vnode
                const vnode = createVNode(rootComponent)
                render(vnode, rootContainer)
            }
        }
    }
}
