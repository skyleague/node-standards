import { readPackageJson } from './package.js'
import { resolveTemplate } from './resolve.js'
import type { ProjectTemplate } from './templates/index.js'
import type { ProjectDefinition, ProjectTemplateBuilder } from './templates/types.js'
import type { PackageJson } from './types.js'

import type { AnyPackageConfiguration } from '../config/config.type.js'
import type { PackageConfiguration } from '../config/index.js'

export function convertLegacyConfiguration(config: AnyPackageConfiguration | undefined): PackageConfiguration | undefined {
    if (config === undefined) {
        return undefined
    }
    if ('type' in config) {
        const { type, template } = config
        const { documentation, exclude, lint } = template ?? {}
        return {
            extends: documentation !== undefined ? [type, documentation] : type,
            ...(exclude !== undefined ? { ignorePatterns: exclude } : {}),
            ...(lint !== undefined ? { rules: lint } : {}),
        }
    }

    return config
}

export class Project {
    public readonly templates: readonly ProjectTemplateBuilder[]
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
        configuration?: AnyPackageConfiguration | undefined
        cwd?: string | undefined
    }) {
        this.cwd = cwd
        this.configurationKey = configurationKey
        this._configuration = convertLegacyConfiguration(configuration ?? this.configuration)
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
        this._configuration = convertLegacyConfiguration(
            this.packagejson[this.configurationKey] as PackageConfiguration | undefined
        )
        return this._configuration
    }

    public get layers(): ProjectDefinition[] | undefined {
        return resolveTemplate(this.templates, { configuration: this.configuration })?.map((x) => ({
            ...x.template,
            type: x.type,
        }))
    }

    public getRequiredTemplates({ order }: { order: 'first' | 'last' }): ProjectDefinition[] {
        return order === 'first' ? this.links.reverse() : this.links
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
                        })
                    )
                    .filter((x): x is ProjectTemplate => x !== undefined) ?? []
            let i = 0
            for (const c of children) {
                if (!(c.type in found) && !ignore.has(c.type)) {
                    found[c.type] = [depth, ++i, { ...c.template, type: c.type }]
                    _links({ links: c.template.extends, overridenBy: c.overrides, depth: depth + 1 })
                    _links({ links: c.template.links, overridenBy: c.overrides, depth: depth + 1 })
                }
            }
            // topological sort (last is first in this case)
            return Object.values(found)
                .sort((a, b) => a[0] - b[0] || a[1] - b[1])
                .reverse()
                .map((x) => x[2])
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
