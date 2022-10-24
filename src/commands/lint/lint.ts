import { getAllFiles } from '../../common'
import { Project } from '../../lib/project'
import type { ProjectTemplateBuilder } from '../../lib/templates/types'
import { PackageType } from '../../lib/types'

import LineDiff from 'line-diff'
import semver from 'semver'
import vdiff from 'variable-diff'

import fs from 'fs'
import path from 'path'

export class ProjectLinter extends Project {
    public readonly fix: boolean
    public shouldFail = false

    public constructor({
        templates,
        configurationKey,
        fix = false,
    }: {
        templates: ProjectTemplateBuilder[]
        configurationKey?: string
        fix?: boolean
    }) {
        super({ templates, configurationKey })
        this.fix = fix
        this.shouldFail = false
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
        target = target.replace(/_npmrc/g, '.npmrc')

        const oldContent = fs.existsSync(target) ? fs.readFileSync(target, 'utf-8') : undefined
        const newContent = fs.readFileSync(from, 'utf-8')

        const oldPermissions = fs.existsSync(target) ? fs.statSync(target).mode : undefined
        const newPermissions = fs.existsSync(from) ? fs.statSync(from).mode : undefined

        const isContentDifferent = oldContent !== newContent
        const isPermissionsDifferent =
            oldPermissions !== undefined && newPermissions !== oldPermissions && newPermissions !== undefined
        const isDifferent = isContentDifferent || isPermissionsDifferent
        if (isDifferent) {
            if (isContentDifferent) {
                if (oldContent !== undefined) {
                    console.warn(`[${target}]:\n${new LineDiff(oldContent, newContent).toString()}`)
                } else {
                    console.warn(`[${target}]: file not found`)
                }
            }

            if (isPermissionsDifferent && newPermissions !== undefined) {
                console.warn(`[${target}]: permissions are not set to ${newPermissions.toString(8)}`)
            }

            this.fail()

            if (this.fix) {
                if (isContentDifferent) {
                    console.log(`Writing ${target}`)
                    const dir = path.dirname(target)
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir, { recursive: true })
                    }
                    fs.writeFileSync(target, newContent, { mode: newPermissions })
                }
                if (isPermissionsDifferent && newPermissions !== undefined) {
                    console.log(`Setting permissions ${target} ${newPermissions.toString(8)}`)
                    fs.chmodSync(target, newPermissions)
                }
            }
        }
    }

    private lintPackage(): void {
        const json = JSON.stringify(this.packagejson, null, 2)
        this.lintConfiguration()
        this.linDefinition()
        this.lintScripts()
        this.lintPublishConfig()
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

    public lintPublishConfig(): void {
        if (this.config?.template?.lint?.publishConfig === false || this.template?.publishConfig === undefined) {
            return
        }

        const json = JSON.stringify(this.packagejson.publishConfig ?? {})

        this.packagejson.publishConfig = this.template?.publishConfig
        if (JSON.stringify(this.packagejson.publishConfig) !== json) {
            console.warn(
                `[package.json>publishConfig] missing or outdated publish configuration found:\n${
                    vdiff(JSON.parse(json), this.packagejson.publishConfig).text
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
        if (this.config?.template?.lint?.scripts === false) {
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
            // check if semver is correct
            if (this.packageSatisfiesRange(this.packagejson.dependencies?.[entry], value)) {
                continue
            }
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
            // check if semver is correct
            if (this.packageSatisfiesRange(this.packagejson.devDependencies?.[entry], value)) {
                continue
            }
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

    public packageSatisfiesRange(from: string | undefined, value: string | undefined): boolean {
        const withoutRanges = from?.replace('^', '')?.replace('~', '')
        const cleaned = withoutRanges !== undefined ? semver.clean(withoutRanges) : undefined
        const satisfiesRange =
            cleaned !== undefined && cleaned !== null && value !== undefined && semver.satisfies(cleaned, value)
        return satisfiesRange
    }
}
