import { Project } from './project'
import type { ProjectTemplateBuilder } from './templates'
import type { PackageConfiguration } from './types'

import { getAllFiles } from '../common'

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
        configuration,
        cwd,
        fix = false,
    }: {
        templates: readonly ProjectTemplateBuilder[]
        configurationKey: string
        configuration?: PackageConfiguration | undefined
        fix?: boolean
        cwd?: string
    }) {
        super({ templates, configurationKey, configuration, cwd })
        this.fix = fix
        this.shouldFail = false
    }

    public lint({ throwOnFail = true }: { throwOnFail?: boolean } = {}): void {
        this.lintPackage()
        this.lintTemplate()

        if (this.shouldFail && throwOnFail) {
            throw new Error('Found errors in the project')
        }
    }

    private lintTemplate(): void {
        const targets: Record<string, () => undefined | void> = {}

        for (const template of this.getRequiredTemplates({
            order: 'first',
        })) {
            for (const root of template.roots) {
                const templateRoot = `${root}/templates/${template.type}/`
                if (!fs.existsSync(templateRoot)) {
                    continue
                }
                for (const file of getAllFiles(templateRoot)) {
                    const relFile = path.relative(templateRoot, file).replace(/\\/g, '/')
                    if (!this.configuration?.template?.exclude?.includes(relFile)) {
                        const target = relFile.replace(/_gitignore$/g, '.gitignore').replace(/_npmrc/g, '.npmrc')

                        targets[relFile] ??= () => this.lintFile(`${templateRoot}${relFile}`, target, template.type)
                    }
                }
            }
        }

        for (const target of Object.values(targets)) {
            target()
        }
    }

    private lintFile(from: string, target: string, origin: string): void {
        let fullTarget = path.join(this.cwd, target)
        const targetBasename = path.basename(target)
        const targetDir = path.dirname(fullTarget)
        const provisionNewOnly = targetBasename.startsWith('+')
        if (provisionNewOnly) {
            fullTarget = path.join(targetDir, targetBasename.slice(1))
        }

        const oldContent = fs.existsSync(fullTarget) ? fs.readFileSync(fullTarget) : undefined
        const newContent = fs.readFileSync(from)

        const targetExists = fs.existsSync(fullTarget)
        const oldPermissions = targetExists ? fs.statSync(fullTarget).mode : undefined
        const newPermissions = fs.existsSync(from) ? fs.statSync(from).mode : undefined

        const isContentDifferent = oldContent?.toString() !== newContent.toString()
        const isPermissionsDifferent =
            oldPermissions !== undefined && newPermissions !== oldPermissions && newPermissions !== undefined
        const isDifferent = isContentDifferent || isPermissionsDifferent
        if (isDifferent && (!provisionNewOnly || !targetExists)) {
            if (isContentDifferent) {
                if (oldContent !== undefined) {
                    console.warn(
                        `[${target}] (${origin}):\n${new LineDiff(oldContent.toString(), newContent.toString()).toString()}`
                    )
                } else {
                    console.warn(`[${target}] (${origin}): file not found`)
                }
            }

            if (isPermissionsDifferent) {
                console.warn(`[${target}]: permissions are not set to ${newPermissions.toString(8)}`)
            }

            this.fail()

            if (this.fix) {
                if (isContentDifferent) {
                    console.log(`Writing ${target}`)
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true })
                    }
                    fs.writeFileSync(fullTarget, newContent, { mode: newPermissions })
                }
                if (isPermissionsDifferent) {
                    console.log(`Setting permissions ${target} ${newPermissions.toString(8)}`)
                    fs.chmodSync(fullTarget, newPermissions)
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
        this.lintLicense()
        this.lintEngines()
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
        const json = JSON.stringify(this.configuration ?? {})
        if (this.packagejson[this.configurationKey] === undefined) {
            this.packagejson[this.configurationKey] = {
                type: 'library',
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
        if (this.configuration?.template?.lint?.definition === false) {
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
        if (this.configuration?.template?.lint?.publishConfig === false) {
            return
        }

        const json = JSON.stringify(this.packagejson.publishConfig ?? {})
        let hasValues = false
        for (const publishConfig of this.getRequiredTemplates({ order: 'last' })
            .map((l) => l.publishConfig)
            .filter((x) => x !== undefined)) {
            this.packagejson.publishConfig = publishConfig
            hasValues = true
        }
        if (JSON.stringify(this.packagejson.publishConfig) !== json && hasValues) {
            console.warn(
                `[package.json>publishConfig] missing or outdated publish configuration found:\n${
                    vdiff(JSON.parse(json), this.packagejson.publishConfig).text
                }`
            )

            this.fail()
        }
    }

    public lintLicense(): void {
        if (this.configuration?.template?.lint?.license === false) {
            return
        }

        const json = JSON.stringify(this.packagejson.license ?? {})
        let hasValues = false
        for (const license of this.getRequiredTemplates({ order: 'last' })
            .map((l) => l.license)
            .filter((x) => x !== undefined)) {
            this.packagejson.license = license
            hasValues = true
        }

        if (JSON.stringify(this.packagejson.license) !== json && hasValues) {
            console.warn(
                `[package.json>license] missing or outdated publish configuration found:\n${
                    vdiff(JSON.parse(json), this.packagejson.license).text
                }`
            )

            this.fail()
        }
    }

    public lintEngines(): void {
        if (this.configuration?.template?.lint?.engines === false) {
            return
        }

        const json = JSON.stringify(this.packagejson.engines ?? {})
        let hasValues = false
        for (const engines of this.getRequiredTemplates({ order: 'last' })
            .map((l) => l.engines)
            .filter((x) => x !== undefined)) {
            this.packagejson.engines = engines
            hasValues = true
        }

        if (JSON.stringify(this.packagejson.engines) !== json && hasValues) {
            console.warn(
                `[package.json>engines] missing or outdated publish configuration found:\n${
                    vdiff(JSON.parse(json), this.packagejson.engines).text
                }`
            )

            this.fail()
        }
    }

    public lintPackageFiles(): void {
        if (this.configuration?.template?.lint?.files === false) {
            return
        }

        if (!this.packagejson.files) {
            this.packagejson.files = []
        }

        const json = JSON.stringify(this.packagejson.files)
        let hasValues = false
        for (const files of this.getRequiredTemplates({ order: 'last' })
            .map((l) => l.files)
            .filter((x) => x !== undefined)) {
            this.packagejson.files = files
            hasValues = true
        }
        if (JSON.stringify(this.packagejson.files) !== json && hasValues) {
            console.warn(
                `[package.json>files] missing or outdated files entries found:\n${
                    vdiff(JSON.parse(json), this.packagejson.files).text
                }`
            )

            this.fail()
        }
    }

    public lintScripts(): void {
        if (this.configuration?.template?.lint?.scripts === false) {
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
        if (this.configuration?.template?.lint?.dependencies === false) {
            return
        }
        this.packagejson.dependencies ??= {}
        this.packagejson.devDependencies ??= {}

        const json = JSON.stringify(this.packagejson.dependencies)
        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) =>
            Object.entries(l.dependencies ?? {})
        )) {
            // check if semver is correct
            if (this.packageSatisfiesRange(this.packagejson.dependencies[entry], value)) {
                continue
            }
            if (value !== undefined) {
                this.packagejson.dependencies[entry] = value
            } else {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
        if (this.configuration?.template?.lint?.devDependencies === false) {
            return
        }
        this.packagejson.dependencies ??= {}
        this.packagejson.devDependencies ??= {}
        const json = JSON.stringify(this.packagejson.devDependencies)

        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) =>
            Object.entries(l.devDependencies ?? {})
        )) {
            // check if semver is correct
            if (this.packageSatisfiesRange(this.packagejson.devDependencies[entry], value)) {
                continue
            }
            if (value !== undefined) {
                this.packagejson.devDependencies[entry] = value
            } else {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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
