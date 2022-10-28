import { ShapeFlags } from "../shared/shapeFlags";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./apiCreateApp";
import { Fragment, Text, VNode } from "./vnode";
import { effect } from "../reactivity";
import { EMPTY_OBJ } from "../shared";

export interface RendererOptions {
    createElement: any
    patchProp: any
    insert: any
}

export function createRenderer(options: RendererOptions) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

    function render(vnode: VNode, container: HTMLElement,) {
        // patch
        patch(null, vnode, container, null)
    }

    function patch(n1: VNode | null, n2: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {

        // 判断处理
        const { type, shapeFlag } = n2

        // 需要特殊处理的 type 
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break
            case Text:
                processText(n1, n2, container)
                break
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, parentComponent)
                }
                break
        }

    }

    // 处理 element
    function processElement(n1: VNode | null, n2: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        if (!n1) {
            // init 
            mountElement(n2, container, parentComponent)
        } else {
            // update
            patchElement(n1, n2, container)
        }
    }

    // 更新 element
    function patchElement(n1: VNode, n2: VNode, container: HTMLElement) {
        // 对比
        // 对比props
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = (n2.el = n1.el)
        patchProps(el, oldProps, newProps)
    }
    function patchProps(el: any, oldProps: any, newProps: any) {
        if (oldProps !== newProps) {
            // 处理新props
            for (const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // 处理老props
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }

                }
            }
        }
    }

    function mountElement(vnode: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        // 存到 vnode 上
        // const el: HTMLElement = (vnode.el = document.createElement(vnode.type))
        const el: HTMLElement = (vnode.el = hostCreateElement(vnode.type))
        const { children, props, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children as string
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode, el, parentComponent)
        }

        // props

        for (let key in props) {
            const prop = props[key]
            // if (isOn(key)) {
            //     const event = key.slice(2).toLocaleLowerCase()
            //     el.addEventListener(event, prop)
            // } else {
            //     el.setAttribute(key, prop)
            // }
            hostPatchProp(el, key, null, prop)
        }

        // container.append(el)
        hostInsert(el, container)
    }

    function mountChildren(vnode: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        (vnode.children as VNode[]).forEach((v: VNode) => {
            patch(null, v, container, parentComponent)
        })
    }

    // 处理 component
    function processComponent(n1: VNode | null, n2: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        mountComponent(n2, container, parentComponent)
    }

    function mountComponent(initialVNode: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    function setupRenderEffect(instance: ComponentInternalInstance, initialVNode: VNode, container: HTMLElement) {
        // 通过 effect 包裹 重新出发render 生成虚拟DOM
        effect(() => {
            if (!instance.isMounted) {
                // 初始化
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, instance)

                // 组件的 所有的 element 都处理完毕
                // 将根节点的el 赋值到 当前组件的虚拟节点上
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // 更新
                const { proxy } = instance
                const prevTree = instance.subTree
                const nextTree = instance.render.call(proxy)
                instance.subTree = nextTree
                patch(prevTree, nextTree, container, instance)
            }
        })
    }

    // 处理 fragment
    function processFragment(n1: VNode | null, n2: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        mountChildren(n2, container, parentComponent)
    }

    // 处理 text
    function processText(n1: VNode | null, n2: VNode, container: HTMLElement) {
        const { children } = n2
        const textNode = (n2.el = document.createTextNode(children as string))
        container.append(textNode)
    }

    return {
        createApp: createAppAPI(render)
    }
}

