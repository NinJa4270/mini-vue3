import pkg from './package.json' assert { type: 'json' };
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from '@rollup/plugin-node-resolve';
export default {
    input: './src/index.ts',
    output: [
        {
            format: 'cjs',
            file: pkg.main
        },
        {
            format: 'es',
            file: pkg.module
        },
    ],
    plugins: [
        nodeResolve(),
        typescript()
    ]
}