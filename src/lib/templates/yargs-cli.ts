import type { ProjectTemplate } from './types'

import { devDependencies, repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const YargsCliTemplate: ProjectTemplate = {
    type: PackageType.YargsCli,
    repositoryUrl,
    scripts: undefined,
    publishConfig: {
        registry: 'https://registry.npmjs.org',
        access: 'public',
    },
    files: ['bin', '.main.js', '.main.js.map', 'index.d.ts', 'src/**/*.d.ts', 'package.json'],
    dependencies: {
        tslib: undefined,
    },
    devDependencies: {
        '@types/source-map-support': devDependencies['@types/source-map-support'],
        'source-map-support': devDependencies['source-map-support'],
        tslib: devDependencies['tslib'],
        yargs: devDependencies['yargs'],
    },
    definition: {
        main: '.main.js',
        types: 'index.d.ts',
    },
    links: [PackageType.CommonTypescript],
    roots: [rootDirectory],
}
