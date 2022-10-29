import { baseCompile } from '@ninja/compiler-core'
export * from '@ninja/runtime-dom'
import * as runtimeDom from '@ninja/runtime-dom'
import { registerRuntimeCompiler } from '@ninja/runtime-dom'

function compileToFunction(template: string) {
    const { code } = baseCompile(template)
    const render = new Function("Vue", code)(runtimeDom)
    return render
}

registerRuntimeCompiler(compileToFunction)