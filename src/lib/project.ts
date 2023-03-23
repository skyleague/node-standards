import { readPackageJson } from './package'
import type { ProjectTemplate } from './templates'
import { getTemplate } from './templates'
import type { ProjectDefinition, ProjectTemplateBuilder } from './templates/types'
import type { PackageConfiguration, PackageJson } from './types'

export class Project {
    public readonly templates: ProjectTemplate[]
    public readonly configurationKey: string

    public constructor({
        templates,
        configurationKey,
    }: {
        templates: ProjectTemplateBuilder[]
        configurationKey?: string | undefined
    }) {
        this.configurationKey = configurationKey ?? 'node-standards'
        const config = this.config
        this.templates = templates.map((t): ProjectTemplate => {
            if (typeof t.template === 'function') {
                return { ...t, template: t.template(config) }
            }
            return t as ProjectTemplate
        })
    }

    public get config(): PackageConfiguration | undefined {
        return this.packagejson[this.configurationKey] as PackageConfiguration | undefined
    }

    public get template(): ProjectDefinition | undefined {
        const template = getTemplate(this.templates, this.config)
        return template !== undefined ? { ...template.template, type: template.type } : undefined
    }

    public getRequiredTemplates({ order }: { order: 'first' | 'last' }): ProjectDefinition[] {
        const safeTemplate = this.template !== undefined ? [this.template] : []
        const [before, after] = this.links
        if (order === 'first') {
            return [...after.reverse(), ...safeTemplate, ...before.reverse()]
        }
        return [...after, ...safeTemplate, ...before]
    }

    public get links(): [before: ProjectDefinition[], after: ProjectDefinition[]] {
        const config = this.config
        const templates = this.templates
        const found: Record<string, ProjectDefinition> = {}
        function _links(links: string[] | undefined, overridenBy?: string) {
            const children =
                links
                    ?.map((type) =>
                        getTemplate(templates, config, {
                            type,
                            allowOverrides: overridenBy === undefined || overridenBy !== type,
                        })
                    )
                    .filter((x): x is ProjectTemplate => x !== undefined) ?? []
            for (const c of children) {
                if (!(c.type in found)) {
                    found[c.type] = { ...c.template, type: c.type }
                    _links(c.template.extends, c.overrides)
                    _links(c.template.links, c.overrides)
                }
            }
            // topological sort (last is first in this case)
            return Object.values(found).reverse()
        }
        return [_links(this.template?.extends), _links(this.template?.links)]
    }

    private _packagejson: PackageJson | undefined = undefined
    public get packagejson(): PackageJson {
        if (this._packagejson !== undefined) {
            return this._packagejson
        }
        this._packagejson = readPackageJson()
        return this._packagejson
    }
}
