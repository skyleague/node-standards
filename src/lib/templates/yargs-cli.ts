import type { ProjectTemplate } from './types'

import { dependencies, devDependencies, repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const YargsCliTemplate: ProjectTemplate = {
    type: PackageType.YargsCli,
    template: {
        repositoryUrl,
        scripts: undefined,
        publishConfig: {
            registry: 'https://registry.npmjs.org',
            access: 'public',
        },
        files: ['bin', '.main.js', '.main.js.map', 'index.d.ts', 'src/**/*.d.ts', 'package.json'],
        dependencies: {
            tslib: dependencies.tslib,
            'source-map-support': dependencies['source-map-support'],
            yargs: dependencies.yargs,
        },
        devDependencies: {
            '@types/source-map-support': devDependencies['@types/source-map-support'],
            yargs: undefined,
            'source-map-support': undefined,
        },
        definition: {
            main: '.main.js',
            types: 'index.d.ts',
        },
        links: [PackageType.CommonTypescript],
        roots: [rootDirectory],
    },
}
