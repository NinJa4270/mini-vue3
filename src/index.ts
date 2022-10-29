import { baseCompile } from './compiler-core'

export * from './runtime-dom'
import * as runtimeDom from './runtime-dom'
import { registerRuntimeCompiler } from './runtime-dom'

function compileToFunction(template: string) {
    const { code } = baseCompile(template)
    const render = new Function("Vue", code)(runtimeDom)
    return render
}

registerRuntimeCompiler(compileToFunction)