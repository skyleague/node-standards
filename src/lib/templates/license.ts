import type { ProjectTemplate } from './types.js'

import { rootDirectory } from '../constants.js'

export const DefaultLicense: ProjectTemplate = {
    type: 'license',
    template: {
        license: 'MIT',
        roots: [rootDirectory],
    },
}
