import type { ProjectTemplate } from './types'

import { rootDirectory } from '../constants'

export const DefaultLicense: ProjectTemplate = {
    type: 'license',
    template: {
        license: 'MIT',
        roots: [rootDirectory],
    },
}
