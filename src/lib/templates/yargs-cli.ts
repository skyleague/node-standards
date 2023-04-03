import type { ProjectTemplateBuilder } from './types.js'

import { dependencies, devDependencies, repositoryUrl, rootDirectory } from '../constants.js'

export const YargsCliTemplate: ProjectTemplateBuilder = {
    type: 'yargs-cli',
    template: {
        repositoryUrl,
        files: ['bin', 'dist', 'package.json'],
        dependencies: {
            tslib: dependencies.tslib,
            'source-map-support': dependencies['source-map-support'],
            yargs: dependencies.yargs,
        },
        devDependencies: {
            '@types/source-map-support': devDependencies['@types/source-map-support'],
            yargs: undefined,
            'source-map-support': undefined,
            '@types/yargs': devDependencies['@types/yargs'],
        },
        exports: {
            '.': './dist/index.js',
            './package.json': './package.json',
            './*.js': './dist/*.js',
        },
        main: undefined,
        types: './dist/index.d.ts',
        packageType: 'module',
        links: ['common-typescript', 'license'],
        roots: [rootDirectory],
    },
}
