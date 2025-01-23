import type { ProjectTemplate } from './types.js'

import { repositoryUrl, rootDirectory } from '../constants.js'

export const TypedocTemplate: ProjectTemplate = {
    type: 'typedoc',
    template: {
        repositoryUrl,
        scripts: {
            'build:docs': 'npx typedoc',
        },
        roots: [rootDirectory],
    },
}
