const fs = require('node:fs')
const path = require('node:path')

/** @type {import('esbuild').Plugin} */
const jsonLoaderPlugin = {
    name: 'json-loader',
    setup: (compiler) => {
        compiler.onLoad({ filter: /.json$/ }, async (args) => {
            const content = await fs.promises.readFile(args.path, 'utf-8')
            return {
                contents: `module.exports = JSON.parse(${JSON.stringify(JSON.stringify(JSON.parse(content)))})`,
            }
        })
    },
}

/** @type {import('esbuild').Plugin} */
const nodeExternalsPlugin = {
    name: 'node-externals',
    setup: (compiler) => {
        compiler.onResolve({ namespace: 'file', filter: /.*/ }, (args) => {
            if (args.path.startsWith('.')) {
                // local refs are not external
                return null
            }
            if (require.resolve(args.path).includes(`${path.sep}node_modules${path.sep}`)) {
                return { path: args.path, external: true }
            }
            return null
        })
    },
}

module.exports = {
    jsonLoaderPlugin,
    nodeExternalsPlugin,
}
