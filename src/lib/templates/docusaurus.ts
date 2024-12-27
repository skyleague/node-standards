import type { ProjectTemplate } from './types.js'

import { repositoryUrl, rootDirectory } from '../constants.js'

export const DocusaurusTemplate: ProjectTemplate = {
    type: 'docusaurus',
    template: {
        repositoryUrl,
        scripts: {
            'build:docs': 'npm run --prefix=docs build',
        },
        devDependencies: {},
        roots: [rootDirectory],
    },
}
