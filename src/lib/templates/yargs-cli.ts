import { dependencies, devDependencies, repositoryUrl, rootDirectory } from '../constants.js'
import type { ProjectTemplateBuilder } from './types.js'

export const YargsCliTemplate: ProjectTemplateBuilder = {
    type: 'yargs-cli',
    template: {
        repositoryUrl,
        files: ['bin', '.dist', 'package.json'],
        dependencies: {
            yargs: dependencies.yargs,
        },
        devDependencies: {
            '@types/yargs': devDependencies['@types/yargs'],
        },
        exports: {
            '.': './.dist/index.js',
            './package.json': './package.json',
            './*.js': './.dist/*.js',
        },
        types: './.dist/index.d.ts',
        packageType: 'module',
        links: ['common-typescript', 'license'],
        roots: [rootDirectory],
    },
}
