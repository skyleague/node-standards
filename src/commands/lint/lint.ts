import { getAllFiles } from '../../common'
import { readPackageJson } from '../../lib/package'
import type { ProjectTemplate } from '../../lib/templates'
import { getTemplate } from '../../lib/templates'
import type { PackageConfiguration, PackageJson } from '../../lib/types'
import { PackageType } from '../../lib/types'

import LineDiff from 'line-diff'
import vdiff from 'variable-diff'

import fs from 'fs'
import path from 'path'

export class ProjectLinter {
    public readonly templates: ProjectTemplate[]
    public readonly configurationKey: string
    public readonly fix: boolean
    public shouldFail = false

    public constructor({
        templates,
        configurationKey,
        fix = false,
    }: {
        templates: ProjectTemplate[]
        configurationKey?: string
        fix?: boolean
    }) {
        this.configurationKey = configurationKey ?? 'node-standards'
        this.fix = fix
        this.shouldFail = false
        this.templates = templates
    }

    public get config(): PackageConfiguration | undefined {
        return this.packagejson[this.configurationKey] as PackageConfiguration | undefined
    }

    public lint(): void {
        this.lintPackage()
        this.lintTemplate()

        if (this.shouldFail) {
            throw new Error('Found errors in the project')
        }
    }
    private lintTemplate(): void {
        const targets: Record<string, () => undefined | void> = {}

        for (const template of this.getRequiredTemplates({
            order: 'first',
        })) {
            for (const root of template?.roots ?? []) {
                const templateRoot = `${root}/templates/${template.type}/`
                if (!fs.existsSync(templateRoot)) {
                    continue
                }
                for (const file of getAllFiles(templateRoot)) {
                    const relFile = path.relative(templateRoot, file).replace(/\\/g, '/')
                    if (!this.config?.template?.exclude?.includes(relFile)) {
                        targets[relFile] ??= () => this.lintFile(`${templateRoot}${relFile}`, relFile)
                    }
                }
            }
        }

        for (const target of Object.values(targets)) {
            target()
        }
    }

    private lintFile(from: string, target: string): void {
        target = target.replace(/_gitignore$/g, '.gitignore')
        const oldContent = fs.existsSync(target) ? fs.readFileSync(target, 'utf-8') : undefined
        const newContent = fs.readFileSync(from, 'utf-8')
        const isDifferent = oldContent !== newContent
        if (isDifferent) {
            if (oldContent !== undefined) {
                console.warn(`[${target}]:\n${new LineDiff(oldContent, newContent).toString()}`)
            } else {
                console.warn(`[${target}]: file not found`)
            }
            this.fail()

            if (this.fix) {
                console.log(`Writing ${target}`)
                const dir = path.dirname(target)
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true })
                }
                fs.writeFileSync(target, newContent)
            }
        }
    }

    private lintPackage(): void {
        const json = JSON.stringify(this.packagejson, null, 2)
        this.lintConfiguration()
        this.linDefinition()
        this.lintScripts()
        this.lintPackageFiles()
        this.lintDependencies()
        this.lintDevDependencies()

        const fixed = JSON.stringify(this.packagejson, null, 2)
        if (this.fix && json !== fixed) {
            fs.writeFileSync(`${process.cwd()}/package.json`, fixed)
            console.log('fixed entries')
        }
    }
    public lintConfiguration(): void {
        const json = JSON.stringify(this.config ?? {})
        if (this.packagejson[this.configurationKey] === undefined) {
            this.packagejson[this.configurationKey] = {
                type: PackageType.Library,
            }
        }
        if (JSON.stringify(this.packagejson[this.configurationKey]) !== json) {
            console.warn(
                `[package.json>${this.configurationKey}] missing or outdated configuration:\n${
                    vdiff(JSON.parse(json), this.packagejson[this.configurationKey]).text
                }`
            )

            this.fail()
        }
    }

    public linDefinition(): void {
        if (this.config?.template?.lint?.definition === false) {
            return
        }

        const json = JSON.stringify(this.packagejson)
        for (const [entry, value] of Object.entries(this.template?.definition ?? {})) {
            this.packagejson[entry] = value
        }
        if (JSON.stringify(this.packagejson) !== json) {
            console.warn(
                `[package.json>${this.configurationKey}] missing or outdated script entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson).text
                }`
            )

            this.fail()
        }
    }

    public lintPackageFiles(): void {
        if (this.config?.template?.lint?.files === false) {
            return
        }

        if (!this.packagejson.files) {
            this.packagejson.files = []
        }

        const json = JSON.stringify(this.packagejson.files)

        this.packagejson.files = this.template?.files ?? []
        if (JSON.stringify(this.packagejson.files) !== json) {
            console.warn(
                `[package.json>files] missing or outdated files entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson.files).text
                }`
            )

            this.fail()
        }
    }

    public lintScripts(): void {
        if (this.config?.template?.lint?.script === false) {
            return
        }
        if (!this.packagejson.scripts) {
            this.packagejson.scripts = {}
        }
        const json = JSON.stringify(this.packagejson.scripts)
        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) =>
            Object.entries(l.scripts ?? {})
        )) {
            this.packagejson.scripts[entry] = value
        }
        this.packagejson.scripts = Object.fromEntries(
            Object.entries(this.packagejson.scripts).sort(([a], [z]) => a.localeCompare(z))
        )
        if (JSON.stringify(this.packagejson.scripts) !== json) {
            console.warn(
                `[package.json>scripts] missing or outdated script entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson.scripts).text
                }`
            )

            this.fail()
        }
    }

    public lintDependencies(): void {
        if (this.config?.template?.lint?.dependencies === false) {
            return
        }
        this.packagejson.dependencies ??= {}
        this.packagejson.devDependencies ??= {}

        const json = JSON.stringify(this.packagejson.dependencies)
        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) =>
            Object.entries(l.dependencies ?? {})
        )) {
            if (value !== undefined) {
                this.packagejson.dependencies[entry] = value
            } else {
                delete this.packagejson.dependencies[entry]
            }
        }
        if (JSON.stringify(this.packagejson.dependencies) !== json) {
            console.warn(
                `[package.json>dependencies] missing or outdated script entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson.dependencies).text
                }`
            )

            this.fail()
        }
    }

    public lintDevDependencies(): void {
        if (this.config?.template?.lint?.devDependencies === false) {
            return
        }
        this.packagejson.dependencies ??= {}
        this.packagejson.devDependencies ??= {}
        const json = JSON.stringify(this.packagejson.devDependencies)

        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) =>
            Object.entries(l.devDependencies ?? {})
        )) {
            if (value !== undefined) {
                this.packagejson.devDependencies[entry] = value
            } else {
                delete this.packagejson.devDependencies[entry]
            }
        }

        if (JSON.stringify(this.packagejson.devDependencies) !== json) {
            console.warn(
                `[package.json>devDependencies] missing or outdated script entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson.devDependencies).text
                }`
            )

            this.fail()
        }
    }

    private fail(): void {
        if (!this.fix) {
            this.shouldFail = true
        }
    }

    private getRequiredTemplates({ order }: { order: 'first' | 'last' }): ProjectTemplate[] {
        const safeTemplate: ProjectTemplate[] = this.template !== undefined ? [this.template] : []
        if (order === 'first') {
            return [...safeTemplate, ...this.links.reverse()]
        }
        return [...this.links, ...safeTemplate]
    }

    public get links(): ProjectTemplate[] {
        const templates = this.templates
        const found: Record<string, ProjectTemplate> = {}
        function _links(links: string[] | undefined, overridenBy?: string) {
            const children =
                links
                    ?.map((type) =>
                        getTemplate(templates, type, { allowOverrides: overridenBy === undefined || overridenBy !== type })
                    )
                    .filter((x): x is ProjectTemplate => x !== undefined) ?? []
            for (const c of children) {
                if (found[c.type] === undefined) {
                    found[c.type] = c
                    _links(c.links, c.overrides)
                }
            }
            // topological sort (last is first in this case)
            return Object.values(found).reverse()
        }
        return _links(this.template?.links)
    }

    public get template(): ProjectTemplate | undefined {
        return getTemplate(this.templates, this.config?.type)
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
