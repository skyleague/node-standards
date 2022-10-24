import type { ProjectTemplate } from './types'

import { repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const DocusaurusTemplate: ProjectTemplate = {
    type: PackageType.Docusaurus,
    template: {
        repositoryUrl,
        scripts: {
            ['build:docs']: '(cd docs; npm install; npm run build)',
        },
        files: undefined,
        dependencies: undefined,
        devDependencies: {},
        definition: undefined,
        links: undefined,
        roots: [rootDirectory],
    },
}
