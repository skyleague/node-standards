import { build } from 'esbuild'
import glob from 'fast-glob'

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
const { jsonLoaderPlugin, nodeExternalsPlugin } = require('@skyleague/node-standards/esbuild.plugins')

async function main() {
    execSync(`rm -rf dist`)
    execSync('npx tsc -p tsconfig.dist.json')

    const srcDir = path.join(__dirname, 'src')
    await Promise.all(
        [...new Set((await glob(path.join(srcDir, '**/*.schema.js'))).map((x) => path.dirname(x)))].map((d) =>
            fs.promises.cp(d, path.join(__dirname, 'dist', path.relative(srcDir, d)), { recursive: true })
        )
    )
}
main().catch((err) => {
    console.error(err)
    process.exit(1)
})
