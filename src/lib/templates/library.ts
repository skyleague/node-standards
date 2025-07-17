import { repositoryUrl, rootDirectory } from '../constants.js'
import type { ProjectTemplateBuilder } from './types.js'

export const LibraryTemplate: ProjectTemplateBuilder = {
    type: 'library',
    template: {
        repositoryUrl,
        files: ['.dist', 'package.json'],
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
