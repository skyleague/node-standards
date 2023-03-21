import type { ProjectTemplateBuilder } from './types'

import { repositoryUrl, rootDirectory } from '../constants'

export const LibraryTemplate: ProjectTemplateBuilder = {
    type: 'library',
    template: (config) => ({
        repositoryUrl,
        files: ['dist', 'package.json'],
        definition: {
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
        },
        links: [...(config?.template?.documentation === 'docusaurus' ? ['docusaurus'] : []), 'common-typescript', 'license'],
        roots: [rootDirectory],
    }),
}
