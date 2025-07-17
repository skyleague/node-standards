import type { PackageConfiguration } from '../config/config.js'
import { readPackageJson } from './package.js'
import { resolveTemplate } from './resolve.js'
import type { ProjectDefinition, ProjectTemplate, ProjectTemplateBuilder } from './templates/types.js'
import type { PackageJson } from './types.js'

export interface ProjectOptions {
    templates: readonly ProjectTemplateBuilder[]
    configurationKey: string
    configuration?: PackageConfiguration | undefined
    cwd?: string | undefined
}

export class Project {
    public readonly templates: readonly ProjectTemplateBuilder[]
    public readonly configurationKey: string
    public readonly cwd: string

    public constructor({ templates, configurationKey, configuration, cwd = process.cwd() }: ProjectOptions) {
        this.cwd = cwd
        this.configurationKey = configurationKey
        this._configuration = configuration ?? this.configuration
        this.templates = templates
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

    public get layers(): ProjectDefinition[] | undefined {
        return resolveTemplate(this.templates, { configuration: this.configuration })?.map((x) => ({
            ...x.template,
            type: x.type,
        }))
    }

    public getRequiredTemplates({ order }: { order: 'first' | 'last' }): ProjectDefinition[] {
        return order === 'first' ? [...this.links].reverse() : this.links
    }

    private _links: ProjectDefinition[] | undefined = undefined
    public get links(): ProjectDefinition[] {
        if (this._links !== undefined) {
            return this._links
        }

        const configuration = this.configuration
        const templates = this.templates
        const layers = this.layers ?? []
        const found: Record<string, [number, number, ProjectDefinition]> = {}
        function _links({
            links,
            overridenBy,
            ignore = new Set<string>(),
            depth = 0,
        }: {
            links: string[] | undefined
            overridenBy?: string | undefined
            ignore?: Set<string>
            depth?: number
        }): ProjectDefinition[] | undefined {
            const children =
                links
                    ?.flatMap((type) =>
                        resolveTemplate(templates, {
                            configuration: configuration,
                            types: [type],
                            allowOverrides: overridenBy === undefined || overridenBy !== type,
                        }),
                    )
                    .filter((x): x is ProjectTemplate => x !== undefined) ?? []
            let i = 0
            for (const c of children) {
                if (!(c.type in found || ignore.has(c.type))) {
                    found[c.type] = [depth, ++i, { ...c.template, type: c.type }]
                    _links({ links: c.template.extends, overridenBy: c.overrides, depth: depth + 1 })
                    _links({ links: c.template.links, overridenBy: c.overrides, depth: depth + 1 })
                }
            }
            // topological sort (last is first in this case)
            const values = Object.values(found)
                .sort((a, b) => a[0] - b[0] || a[1] - b[1])
                .reverse()
                .map((x) => x[2])
            return values
        }
        this._links = _links({ links: layers.map((l) => l.type) }) ?? []
        return this._links
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
