
import { createRenderer } from "../runtime-core";

const isOn = (key: string) => /^on[A-Z]/.test(key)
function createElement(type: any) {
    return document.createElement(type)
}
function patchProp(el: HTMLElement, key: string, prevProp: any, nextProp: any) {
    if (isOn(key)) {
        const event = key.slice(2).toLocaleLowerCase()
        el.addEventListener(event, nextProp)
    } else {
        if (nextProp === undefined || nextProp === null) {
            el.removeAttribute(key)
        } else {
            el.setAttribute(key, nextProp)
        }
    }
}
function insert(el: HTMLElement, container: HTMLElement) {
    container.append(el)
}

function remove(child: HTMLElement) {
    const parent = child.parentNode
    if (parent) {
        parent.removeChild(child)
    }
}

function setElementText(el: HTMLElement, text: string) {
    el.textContent = text
}

const renderer: any = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText
})


export function createApp(...args: any) {
    return renderer.createApp(...args)
}

export * from '../runtime-core'