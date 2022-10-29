import { NodeTypes, TemplateChildNode } from "./ast";

export function isText(node: TemplateChildNode): boolean {
    return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
}