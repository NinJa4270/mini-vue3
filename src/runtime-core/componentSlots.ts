import { ShapeFlags } from "../shared/shapeFlags"
import { ComponentInternalInstance } from "./component"

export function initSlots(instance: ComponentInternalInstance, children: any) {
    const { vnode } = instance
    if (vnode.shapeFlag & ShapeFlags.SLOTS_CHILDREN) {
        normalizeObjectSlots(children, instance.slots)
    }
}

function normalizeObjectSlots(children: any, slots: any) {
    for (const key in children) {
        const slot = children[key]
        if (typeof slot === 'function') {
            slots[key] = (props: any = {}) => normalizeSlotValue(slot(props))
        } else {
            slots[key] = slot
        }
    }
}

function normalizeSlotValue(slot: any) {
    return Array.isArray(slot) ? slot : [slot]
}