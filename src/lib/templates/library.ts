import type { ProjectTemplateBuilder } from './types'

import { repositoryUrl, rootDirectory } from '../constants'

export const LibraryTemplate: ProjectTemplateBuilder = {
    type: 'library',
    template: {
        repositoryUrl,
        files: ['dist', 'package.json'],
        definition: {
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
        },
        links: ['common-typescript', 'license'],
        roots: [rootDirectory],
    },
}
