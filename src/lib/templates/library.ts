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
        files: ['.main.js', '.main.js.map', 'index.d.ts', 'src/**/*.d.ts', 'package.json'],
        dependencies: undefined,
        devDependencies: undefined,
        definition: {
            main: '.main.js',
            types: 'index.d.ts',
        },
        links: [
            ...(config?.template?.documentation === 'docusaurus' ? [PackageType.Docusaurus] : []),
            PackageType.CommonTypescript,
        ],
        roots: [rootDirectory],
    }),
}
