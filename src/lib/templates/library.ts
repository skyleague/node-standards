import type { ProjectTemplateBuilder } from './types'

import { repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const LibraryTemplate: ProjectTemplateBuilder = {
    type: PackageType.Library,
    template: (config) => ({
        repositoryUrl,
        scripts: undefined,
        publishConfig: {
            registry: 'https://registry.npmjs.org',
            access: 'public',
        },
        files: ['dist', 'package.json'],
        dependencies: undefined,
        devDependencies: undefined,
        definition: {
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
        },
        links: [
            ...(config?.template?.documentation === 'docusaurus' ? [PackageType.Docusaurus] : []),
            PackageType.CommonTypescript,
        ],
        roots: [rootDirectory],
    }),
}
