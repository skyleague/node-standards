import type { ProjectTemplateBuilder } from './types'

import { dependencies, devDependencies, repositoryUrl, rootDirectory } from '../constants'

export const YargsCliTemplate: ProjectTemplateBuilder = {
    type: 'yargs-cli',
    template: {
        repositoryUrl,
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
        links: ['common-typescript', 'license'],
        roots: [rootDirectory],
    },
}
