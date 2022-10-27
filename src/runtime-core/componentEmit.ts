import { ComponentInternalInstance } from "./component"

export function emit(instance: ComponentInternalInstance, event: string, ...args: any[]) {
    // 从组件中 找到对应的 event
    const { props } = instance

    // TPP 
    // const handler = props['onAdd']
    // handler && handler()
    const camelize = (str: string) => str.replace(/-(\w)/g, (_, c: string) => {
        return c ? c.toUpperCase() : ''
    })
    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
    const toHandlerKey = (str: string) => {
        return str ? 'on' + capitalize(str) : ''
    }

    const handlerName = toHandlerKey(camelize(event))
    const handler = props[handlerName]
    handler && handler(...args)
}