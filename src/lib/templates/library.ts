import type { ProjectTemplate } from './types'

import { repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const LibraryTemplate: ProjectTemplate = {
    type: PackageType.Library,
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
    links: [PackageType.CommonTypescript],
    roots: [rootDirectory],
}
