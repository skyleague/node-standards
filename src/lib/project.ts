import { readPackageJson } from './package.js'
import { resolveTemplate } from './resolve.js'
import type { ProjectTemplateVariables } from './template.js'
import type { ProjectTemplate } from './templates/index.js'
import type { ProjectDefinition, ProjectTemplateBuilder } from './templates/types.js'
import type { PackageJson } from './types.js'

import { isIgnored, spawn } from '../common/index.js'
import { PackageConfiguration } from '../config/config.type.js'

import enquirer from 'enquirer'
import fg from 'fast-glob'
import pLimit from 'p-limit'
import type { Argv } from 'yargs'

import NodeBuffer from 'node:buffer'
import { existsSync, mkdirSync, promises } from 'node:fs'
import path, { dirname, join } from 'node:path'

export interface ProjectOptions {
    templates: readonly ProjectTemplateBuilder[]
    configurationKey: string
    name?: string | undefined
    configuration?: PackageConfiguration | undefined
    forceVarStorage?: boolean | undefined
    cwd?: string | undefined
}

export class Project {
    public readonly templates: readonly ProjectTemplateBuilder[]
    public readonly configurationKey: string
    public readonly name: string | undefined
    public readonly cwd: string
    public forceVarStorage: boolean

    public constructor({
        templates,
        configurationKey,
        name,
        configuration,
        forceVarStorage,
        cwd = process.cwd(),
    }: ProjectOptions) {
        this.cwd = cwd
        this.configurationKey = configurationKey
        this.name = name
        this._configuration = configuration ?? this.configuration
        this.templates = templates
        this.forceVarStorage = forceVarStorage ?? false
    }

    public reload(): void {
        this._configuration = undefined
        this._packagejson = undefined
        this._templateVariables = undefined
    }

    private _configuration: PackageConfiguration | undefined = undefined
    public get configuration(): PackageConfiguration | undefined {
        if (this._configuration !== undefined) {
            return this._configuration
        }
        const packagejson = this.packagejson[this.configurationKey]
        if (PackageConfiguration.is(packagejson)) {
            this._configuration = packagejson
        } else if (packagejson !== undefined) {
            console.error('Given package configuration is not valid', PackageConfiguration.errors)
            this._configuration = undefined
        }
        return this._configuration
    }

    private _templateVariables: ProjectTemplateVariables | undefined = undefined
    public get templateVariables(): ProjectTemplateVariables {
        if (this._templateVariables !== undefined) {
            return this._templateVariables
        }

        this._templateVariables = {
            packageName: {
                literal: ['@skyleague\\/__package_name__', '__package_name__'],
                prompt: {
                    initial: this.name,
                    message: `What is the package name (example: @skyleague/node-standards)?`,
                },
                infer: ({ packagejson }) => packagejson.name,
                skipStore: true,
            },
            projectName: {
                literal: ['@skyleague\\/__project_name__', '__project_name__'],
                prompt: {
                    initial: this.name?.split('/')?.at(-1),
                    message: 'What is the project name (example: node-standards)?',
                },
                infer: ({ packagejson }) => packagejson.name?.split('/').at(-1),
                skipStore: true,
            },
        }

        for (const value of this.getRequiredTemplates({ order: 'first' }).map((l) => l.templateVariables)) {
            for (const [key, variable] of Object.entries(value ?? {})) {
                // allow overriding of the template literal
                if (this._templateVariables[key] !== undefined) {
                    this._templateVariables[key] = { ...this._templateVariables[key], ...variable }
                } else {
                    this._templateVariables[key] = variable
                }
            }
        }

        return this._templateVariables
    }

    protected async evaluate(argv: Record<string, string> = {}): Promise<void> {
        const variables = this.templateVariables
        for (const [name, entry] of Object.entries(variables)) {
            if (argv[name] !== undefined) {
                entry.value = argv[name]
            } else if (entry.infer !== undefined && entry.value === undefined) {
                entry.value =
                    this.configuration?.projectSettings?.[name] ?? entry.infer({ packagejson: this.packagejson, cwd: this.cwd })
            }
        }

        const answers = await enquirer.prompt(
            Object.entries(variables)
                .filter(([, value]) => value.value === undefined)
                .map(([key, value]) => ({
                    name: key,
                    type: 'input',
                    message: `What is the ${key}?`,
                    ...value.prompt,
                }))
        )

        for (const [key, answer] of Object.entries(answers)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            variables[key]!.value = answer as string
        }
    }

    public builder(yargs: Argv) {
        const variables = this.templateVariables
        for (const [name, entry] of Object.entries(variables)) {
            if (entry.infer !== undefined && entry.value === undefined) {
                entry.value =
                    this.configuration?.projectSettings?.[name] ?? entry.infer({ packagejson: this.packagejson, cwd: this.cwd })
            }
            yargs = yargs.option(name, { type: 'string' })
        }
        return yargs
    }

    public async create({
        type,
        targetDir,
        argv,
    }: {
        type: string
        targetDir: string
        argv: Record<string, string>
    }): Promise<void> {
        await this.evaluate(argv)

        const template = this.layers![0]!
        const fromDir = path.join(template.roots[0], `examples/${type}`)

        await spawn('git', ['init', targetDir, '-b', 'main'])

        console.log(`Creating a new project in ${targetDir}.`)

        const limit = pLimit(255)

        const entries = await fg('**/*', {
            dot: true,
            cwd: fromDir,
            followSymbolicLinks: false,
            ignore: ['**/node_modules/**'],
        })

        const directories = new Set<string>()
        for (const dir of entries.map((f) => dirname(join(targetDir, f)))) {
            directories.add(dir)
        }

        for (const dir of directories) {
            mkdirSync(dir, { recursive: true })
        }

        const fromGitIgnore = join(fromDir, '.gitignore')
        if (existsSync(fromGitIgnore)) {
            await promises.copyFile(fromGitIgnore, join(targetDir, '.gitignore'))
        }

        await Promise.allSettled(
            entries.map((f) =>
                limit(async () => {
                    if (!isIgnored(f, { cwd: targetDir })) {
                        console.log(`Copying ${f}`)

                        const content = await promises.readFile(join(fromDir, f))
                        const rendered = NodeBuffer.isUtf8(content)
                            ? Buffer.from(this.renderContent(content.toString()))
                            : content
                        return promises.writeFile(join(targetDir, f), rendered)
                    }
                    return
                })
            )
        )
    }

    public renderContent(content: string): string {
        for (const [key, { value, literal, render }] of Object.entries(this.templateVariables)) {
            if (value !== undefined) {
                for (const lit of Array.isArray(literal) ? literal : [literal]) {
                    const literalName = lit ?? `__${key}__`
                    content =
                        render?.({
                            content,
                            value,
                            literal: literalName,
                        }) ?? content.replace(new RegExp(`${literalName}(\\w+__)?`, 'g'), value)
                }
            }
        }
        return content
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
