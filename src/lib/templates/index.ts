import { CommonTemplate, CommonTypescriptTemplate } from './common'
import { DocusaurusTemplate } from './docusaurus'
import { LibraryTemplate } from './library'
import { DefaultLicense } from './license'
import type { ProjectTemplate, ProjectTemplateBuilder } from './types'
import { YargsCliTemplate } from './yargs-cli'

import type { PackageConfiguration } from '../types'
export { CommonTemplate } from './common'
export { LibraryTemplate } from './library'
export { YargsCliTemplate } from './yargs-cli'
export { ProjectTemplate } from './types'
export { DocusaurusTemplate } from './docusaurus'
export { ProjectTemplateBuilder } from './types'

export const templates = [
    CommonTemplate,
    CommonTypescriptTemplate,
    LibraryTemplate,
    YargsCliTemplate,
    DocusaurusTemplate,
    DefaultLicense,
]

export function getTemplate(
    xs: ProjectTemplateBuilder[],
    config?: PackageConfiguration | undefined,
    { allowOverrides = true, type = config?.type }: { allowOverrides?: boolean; type?: string } = {}
): ProjectTemplate | undefined {
    const template = xs.find((x) => x.type === type || (allowOverrides && x.overrides === type))

    const evaluatedTemplate = typeof template?.template === 'function' ? template.template(config) : template?.template
    return template !== undefined && evaluatedTemplate !== undefined
        ? {
              ...template,
              template: evaluatedTemplate,
          }
        : undefined
}
