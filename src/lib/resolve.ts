import type { ProjectTemplate, ProjectTemplateBuilder } from './templates'

import type { PackageConfiguration } from '../config'

export function resolveTemplate(
    xs: readonly ProjectTemplateBuilder[],
    {
        configuration,
        allowOverrides = true,
        types = configuration?.extends !== undefined && Array.isArray(configuration.extends)
            ? configuration.extends
            : configuration?.extends !== undefined
            ? [configuration.extends]
            : [],
    }: { configuration: PackageConfiguration | undefined; allowOverrides?: boolean; types?: string[] }
): [ProjectTemplate, ...ProjectTemplate[]] | undefined {
    const results = []
    for (const type of types) {
        const template = xs.find((x) => x.type === type || (allowOverrides && x.overrides === type))
        if (template?.template !== undefined) {
            results.push({
                ...template,
                template: template.template,
            })
        }
    }
    return results.length > 0 ? (results as [ProjectTemplate, ...ProjectTemplate[]]) : undefined
}
