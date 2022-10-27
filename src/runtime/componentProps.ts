import { ComponentInternalInstance } from "./component";

export function initProps(instance: ComponentInternalInstance, rawProps: any) {
    instance.props = rawProps || {}
}