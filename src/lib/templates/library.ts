import type { ProjectTemplateBuilder } from './types.js'

import { repositoryUrl, rootDirectory } from '../constants.js'

export const LibraryTemplate: ProjectTemplateBuilder = {
    type: 'library',
    template: {
        repositoryUrl,
        files: ['dist', 'package.json'],
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
