import { ShapeFlags } from "../shared/shapeFlags";
import { ComponentInternalInstance, createComponentInstance, setupComponent } from "./component"
import { createAppAPI } from "./apiCreateApp";
import { Fragment, isSameVNodeType, Text, VNode } from "./vnode";
import { effect } from "../reactivity";
import { EMPTY_OBJ } from "../shared";
import { shouldUpdateComponent } from "./componentRenderUtils";
import { queueJob } from "./scheduler";

export interface RendererOptions {
    createElement: any
    patchProp: any
    insert: any
    remove: any
    setElementText: any
}

export function createRenderer(options: RendererOptions) {

    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options

    function render(vnode: VNode, container: HTMLElement,) {
        // patch
        patch(null, vnode, container, null, null)
    }

    function patch(n1: VNode | null, n2: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
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
                    processElement(n1, n2, container, anchor, parentComponent)
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    processComponent(n1, n2, container, anchor, parentComponent)
                }
                break
        }

    }

    // 处理 element
    function processElement(n1: VNode | null, n2: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
        if (!n1) {
            // init 
            mountElement(n2, container, anchor, parentComponent)
        } else {
            // update
            patchElement(n1, n2, container, anchor, parentComponent)
        }
    }

    // 更新 element
    function patchElement(n1: VNode, n2: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
        // 对比
        const el = (n2.el = n1.el)
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ

        // 对比children
        patchChildren(n1, n2, el, anchor, parentComponent!)
        // 对比props
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
    function patchChildren(n1: VNode, n2: VNode, container: any, anchor: Node | null, parentComponent: ComponentInternalInstance) {
        // 四种情况
        // 1.新的 文本 ｜ 老的 数组
        // 2.新的 文本 ｜ 老的 文本
        // 3 新的 数组 ｜ 老的 文本
        // 4.新的 数组 ｜ 老的 数组
        const prevShapeFlag = n1.shapeFlag
        const nextShapeFlag = n2.shapeFlag
        const c1 = n1 && n1.children
        const c2 = n2.children

        // 新的是文本
        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                // 第一种情况
                // 1.清空 prev
                unmountChildren(c1 as VNode[])
                // 2.设置 next text
            }
            if (c1 !== c2) {
                //  第一种 第二种都 走这里
                hostSetElementText(container, c2)
            }
        } else {
            // 新的是数组
            // 第三种 老的是文本
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2 as VNode[], container, parentComponent)
            } else {
                // 第四种 数组对比
                patchKeyedChildren(c1 as VNode[], c2 as VNode[], container, anchor, parentComponent)
            }
        }
    }

    function patchKeyedChildren(c1: VNode[], c2: VNode[], container: HTMLElement, parentAnchor: Node | null, parentComponent: ComponentInternalInstance) {
        /** 
         *  [i]  [e1]
         *  (a b) c
         *  (a b) d e 
         *         [e2]
         *  
         * */
        let i = 0
        const l2 = c2.length
        let e1 = c1.length - 1
        let e2 = l2 - 1

        // 通过双端对比 缩小中间范围
        // 左侧遍历 (通过移动 i) 对相同节点进行再次patch 遇到不同节点时推出 
        while (i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            if (isSameVNodeType(n1, n2)) {
                // 相同节点 继续递归调用 patch
                patch(n1, n2, container, parentAnchor, parentComponent)
            } else {
                break
            }
            i++
        }
        // 右侧遍历 (通过移动 e1,e2)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            if (isSameVNodeType(n1, n2)) {
                // 相同节点 继续递归调用 patch
                patch(n1, n2, container, parentAnchor, parentComponent)
            } else {
                break
            }
            e1--
            e2--
        }

        if (i > e1) {
            if (i <= e2) {
                // 新的比老的长 新增节点
                const nextPos = e2 + 1
                console.log('%crenderer.ts line:176 新增', 'color: #007acc;');
                // 设置 anchor 锚点 将元素插入的 anchor之前
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor

                while (i <= e2) {
                    patch(null, c2[i], container, anchor, parentComponent)
                    i++
                }
            }
        } else if (i > e2) {
            //老的比新的长 删除节点
            while (i <= e1) {
                unmount(c1[i])
                i++
            }
        } else {
            // 中间对比
            console.log('%crenderer.ts line:196 中间对比', 'color: #007acc;',);
            const s1 = i // 老节点的开始
            const s2 = i // 新节点的开始
            // 优化 是否需要移动 是否需要生成最长递增子序列
            let moved = false // 标识 是否需要移动
            let maxNewIndexSoFar = 0
            // 优化
            // 当 patched 等于 toBePatched
            // 说明新节点已经被全部更新完毕 此时老节点中还有剩余 则不需要再查找 直接删除
            let patched = 0 // 每次新节点patch 进行加1 
            const toBePatched = e2 - s2 + 1  // 新节点中 需要被pactch的总数量 

            // 优化 用于求最长递增子序列 
            const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

            // 优化 映射表 方便从新元素中查找旧元素
            const keyToNewIndexMap = new Map()

            // 遍历新的数组 进行映射缓存
            for (let i = s2; i <= e2; i++) {
                const nextChild = c2[i]
                keyToNewIndexMap.set(nextChild.key, i)
            }

            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i]
                if (patched >= toBePatched) {  // 新节点 已经全部更细完毕 删除剩余老节点
                    console.log('%crenderer.ts line:218 提前删除', 'color: #007acc;',);
                    unmount(prevChild)
                    continue
                }

                let newIndex
                // 两种方案 1.通过key去查找缓存 2.直接遍历
                if (prevChild.key != null) {
                    console.log('%crenderer.ts line:223 通过key删除', 'color: #007acc;',);
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                } else {
                    console.log('%crenderer.ts line:226 通过遍历删除', 'color: #007acc;',);
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j
                            break
                        }
                    }
                }

                if (newIndex === undefined) {
                    // 当前旧节点 一定不存在新节点中 需要删除
                    unmount(prevChild)
                } else {

                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex
                    } else {
                        moved = true
                    }

                    // 旧节点 存在与新节点中
                    newIndexToOldIndexMap[newIndex - s2] = i + 1 // 这里不能让 i为0 为0在newIndexToOldIndexMap是有意义的 所以强制+1来保存
                    patch(prevChild, c2[newIndex], container, null, parentComponent)
                    patched++
                }
            }

            // 生成最长递增子序列
            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            console.log('%crenderer.ts line:251 increasingNewIndexSequence', 'color: #007acc;', increasingNewIndexSequence);
            // 遍历 旧的节点 和 最长递增子序列
            // 正向遍历并不能保证正确的顺序
            // let j = 0
            // for (let i = 0; i < toBePatched; i++) {
            //     if (i !== increasingNewIndexSequence[j]) {
            //         console.log('%crenderer.ts line:256 移动位置', 'color: #007acc;', i);
            //     } else {
            //         j++
            //     }
            // }
            let j = increasingNewIndexSequence.length - 1
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2  // 当前需要处理的节点索引
                const nextChild = c2[nextIndex] as VNode // 需要处理的节点
                //              当前节点的下一个        大于长度
                const anchor = nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor // 对应的锚点

                if (newIndexToOldIndexMap[i] === 0) {
                    // 标识需要创建新节点
                    patch(null, nextChild, container, anchor, parentComponent)
                } else if (moved) {
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        console.log('%crenderer.ts line:256 移动位置', 'color: #007acc;', i);
                        hostInsert(nextChild.el, container, anchor)
                    } else {
                        j--
                    }
                }
            }

        }
    }

    function unmount(vnode: VNode) {
        hostRemove(vnode.el!)
    }

    // 清空子节点
    function unmountChildren(children: VNode[]) {
        for (let i = 0, len = children.length; i < len; i++) {
            const child = children[i]
            // 删除
            unmount(child)
        }
    }

    function mountElement(vnode: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
        // 存到 vnode 上
        // const el: HTMLElement = (vnode.el = document.createElement(vnode.type))
        const el: HTMLElement = (vnode.el = hostCreateElement(vnode.type))
        const { children, props, shapeFlag } = vnode

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children as string
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children as VNode[], el, parentComponent)
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
        hostInsert(el, container, anchor)
    }

    function mountChildren(children: VNode[], container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        children.forEach((v: VNode) => {
            patch(null, v, container, null, parentComponent)
        })
    }

    // 处理 component
    function processComponent(n1: VNode | null, n2: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
        if (!n1) {
            // init
            mountComponent(n2, container, anchor, parentComponent)
        } else {
            // update
            updateComponent(n1, n2)
        }
    }

    // 更新 component
    function updateComponent(n1: VNode, n2: VNode) {
        const instance = (n2.component = n1.component)
        if (shouldUpdateComponent(n1, n2)) { // 判断当前组件是否需要更新
            // 调用组件的 render 重新生成vnode
            instance!.next = n2
            instance!.update()
        } else {
            n2.el = n1.el
            instance!.vnode = n2
        }
    }

    // 挂载 component
    function mountComponent(initialVNode: VNode, container: HTMLElement, anchor: Node | null, parentComponent: ComponentInternalInstance | null) {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent))
        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    function setupRenderEffect(instance: ComponentInternalInstance, initialVNode: VNode, container: HTMLElement, anchor: Node | null) {
        // 通过 effect 包裹 重新出发render 生成虚拟DOM
        instance!.update = effect(() => {
            if (!instance.isMounted) {
                // 初始化
                console.log('%crenderer.ts line:372 mount', 'color: #007acc;', instance);
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))
                // vnode => patch
                // vnode => element => mountElement
                patch(null, subTree, container, anchor, instance)

                // 组件的 所有的 element 都处理完毕
                // 将根节点的el 赋值到 当前组件的虚拟节点上
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // 更新
                console.log('%crenderer.ts line:384 update', 'color: #007acc;', instance);
                // 更新组件实例的属性
                // 先更新组件的props 组件才能拿到最新的props
                // 先拿到更新前后的虚拟节点 
                const { next, vnode } = instance
                if (next) {
                    //  更新真实dom
                    next.el = vnode.el
                    // 更新属性
                    updateComponentPreRender(instance, next)
                }

                const { proxy } = instance
                const prevTree = instance.subTree
                const nextTree = instance.render.call(proxy)
                instance.subTree = nextTree
                patch(prevTree, nextTree, container, anchor, instance)
            }
        }, {
            scheduler: () => queueJob(instance.update)
        })
    }

    // 更新组件实例的属性
    function updateComponentPreRender(instance: ComponentInternalInstance, nextVNode: VNode) {
        instance.vnode = nextVNode
        instance.next = null
        instance.props = nextVNode.props
    }

    // 处理 fragment
    function processFragment(n1: VNode | null, n2: VNode, container: HTMLElement, parentComponent: ComponentInternalInstance | null) {
        mountChildren(n2.children as VNode[], container, parentComponent)
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


// 生成最长递增子序列
function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
        const arrI = arr[i]
        if (arrI !== 0) {
            j = result[result.length - 1]
            if (arr[j] < arrI) {
                p[i] = j
                result.push(i)
                continue
            }
            u = 0
            v = result.length - 1
            while (u < v) {
                c = (u + v) >> 1
                if (arr[result[c]] < arrI) {
                    u = c + 1
                } else {
                    v = c
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1]
                }
                result[u] = i
            }
        }
    }
    u = result.length
    v = result[u - 1]
    while (u-- > 0) {
        result[u] = v
        v = p[v]
    }
    return result
}
