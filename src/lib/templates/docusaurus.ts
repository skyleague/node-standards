import type { ProjectTemplate } from './types'

import { repositoryUrl, rootDirectory } from '../constants'

export const DocusaurusTemplate: ProjectTemplate = {
    type: 'docusaurus',
    template: {
        repositoryUrl,
        scripts: {
            ['build:docs']: '(cd docs; npm install; npm run build)',
        },
        devDependencies: {},
        roots: [rootDirectory],
    },
}
