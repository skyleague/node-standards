import { readPackageJson } from './package'
import type { ProjectTemplate } from './templates'
import { getTemplate } from './templates'
import type { ProjectDefinition, ProjectTemplateBuilder } from './templates/types'
import type { PackageConfiguration, PackageJson } from './types'

export class Project {
    private readonly _templates: readonly ProjectTemplateBuilder[]
    public readonly configurationKey: string
    public readonly cwd: string

    public constructor({
        templates,
        configurationKey,
        configuration,
        cwd = process.cwd(),
    }: {
        templates: readonly ProjectTemplateBuilder[]
        configurationKey: string
        configuration?: PackageConfiguration | undefined
        cwd?: string | undefined
    }) {
        this.cwd = cwd
        this.configurationKey = configurationKey
        this._configuration = configuration ?? this.configuration
        this._templates = templates
    }

    public get templates(): ProjectTemplate[] {
        return this._templates.map((t): ProjectTemplate => {
            if (typeof t.template === 'function') {
                return { ...t, template: t.template(this._configuration) }
            }
            return t as ProjectTemplate
        })
    }

    public reload(): void {
        this._configuration = undefined
        this._packagejson = undefined
    }

    private _configuration: PackageConfiguration | undefined = undefined
    public get configuration(): PackageConfiguration | undefined {
        if (this._configuration !== undefined) {
            return this._configuration
        }
        this._configuration = this.packagejson[this.configurationKey] as PackageConfiguration | undefined
        return this._configuration
    }

    public get template(): ProjectDefinition | undefined {
        const template = getTemplate(this.templates, this.configuration)
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
        const config = this.configuration
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
        this._packagejson = readPackageJson({ cwd: this.cwd })
        return this._packagejson
    }
}
