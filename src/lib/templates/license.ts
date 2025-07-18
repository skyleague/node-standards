import { rootDirectory } from '../constants.js'
import type { ProjectTemplate } from './types.js'

export const DefaultLicense: ProjectTemplate = {
    type: 'license',
    template: {
        license: 'MIT',
        roots: [rootDirectory],
    },
}
