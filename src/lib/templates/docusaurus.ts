import type { ProjectTemplate } from './types.js'

import { repositoryUrl, rootDirectory } from '../constants.js'

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
