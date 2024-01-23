import { Project } from './project.js'
import type { ProjectTemplateBuilder } from './templates/index.js'
import type { ProjectTemplateDefinition } from './templates/types.js'
import type { PackageJson } from './types.js'

import { getAllFiles } from '../common/index.js'
import type { PackageConfiguration } from '../config/config.type.js'

import LineDiff from 'line-diff'
import semver from 'semver'
import vdiff from 'variable-diff'

import fs from 'node:fs'
import path from 'node:path'

export class ProjectLinter extends Project {
    public readonly fix: boolean
    public shouldFail = false

    public constructor({
        templates,
        configurationKey,
        name,
        configuration,
        cwd,
        fix = false,
    }: {
        templates: readonly ProjectTemplateBuilder[]
        configurationKey: string
        name?: string
        configuration?: PackageConfiguration | undefined
        fix?: boolean
        cwd?: string
    }) {
        super({ templates, configurationKey, name, configuration, cwd })
        this.fix = fix
        this.shouldFail = false
    }

    public async lint({ throwOnFail = true }: { throwOnFail?: boolean } = {}): Promise<void> {
        await this.lintPackage()
        this.lintTemplate()

        if (this.shouldFail && throwOnFail) {
            throw new Error('Found errors in the project')
        }
    }

    private lintTemplate(): void {
        const targets: Record<string, undefined | (() => void)> = {}

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
                    const target = relFile.replace(/_gitignore$/g, '.gitignore').replace(/_npmrc/g, '.npmrc')
                    const strippedTarget = target.replace(/^[+-]/, '')
                    if (!this.configuration?.ignorePatterns?.includes(strippedTarget)) {
                        targets[strippedTarget] ??= () => {
                            this.lintFile(`${templateRoot}${relFile}`, target, template.type)
                        }
                    }
                }
            }
        }

        for (const target of Object.values(targets)) {
            target?.()
        }
    }

    private lintFile(from: string, target: string, origin: string): void {
        let fullTarget = path.join(this.cwd, target)
        const targetBasename = path.basename(target)
        const targetDir = path.dirname(fullTarget)

        const removeExisting = targetBasename.startsWith('-')
        const provisionNewOnly = targetBasename.startsWith('+')
        if (provisionNewOnly || removeExisting) {
            fullTarget = path.join(targetDir, targetBasename.slice(1))
        }

        const oldContent = fs.existsSync(fullTarget) ? fs.readFileSync(fullTarget).toString() : undefined
        const newContent = removeExisting ? undefined : this.renderContent(fs.readFileSync(from).toString())

        const targetExists = fs.existsSync(fullTarget)
        const oldPermissions = targetExists ? fs.statSync(fullTarget).mode : undefined
        const newPermissions = fs.existsSync(from) ? fs.statSync(from).mode : undefined

        const isContentDifferent = oldContent !== newContent
        const isPermissionsDifferent =
            oldPermissions !== undefined && newPermissions !== oldPermissions && newPermissions !== undefined
        const isDifferent = isContentDifferent || isPermissionsDifferent
        if (isDifferent && (!provisionNewOnly || !targetExists || removeExisting)) {
            if (isContentDifferent) {
                if (oldContent !== undefined) {
                    console.warn(`[${target}] (${origin}):\n${new LineDiff(oldContent, newContent ?? '').toString()}`)
                } else {
                    console.warn(`[${target}] (${origin}): file not found`)
                }
            }

            if (isPermissionsDifferent) {
                console.warn(`[${target}]: permissions are not set to ${newPermissions.toString(8)}`)
            }

            this.fail()

            if (this.fix) {
                if (removeExisting || newContent === undefined) {
                    fs.unlinkSync(fullTarget)
                } else if (isContentDifferent) {
                    console.log(`Writing ${target}`)
                    if (!fs.existsSync(targetDir)) {
                        fs.mkdirSync(targetDir, { recursive: true })
                    }
                    fs.writeFileSync(fullTarget, newContent, { mode: newPermissions })
                }
                if (isPermissionsDifferent && !removeExisting) {
                    console.log(`Setting permissions ${target} ${newPermissions.toString(8)}`)
                    fs.chmodSync(fullTarget, newPermissions)
                }
            }
        }
    }

    private async lintPackage(): Promise<void> {
        const json = JSON.stringify(this.packagejson, null, 2)
        await this.evaluate()
        this.lintConfiguration()
        this.lintScripts()
        this.lintPublishConfig()
        this.lintLicense()
        this.lintEngines()
        this.lintPackageFiles()
        this.lintDependencies()
        this.lintDevDependencies()
        this.lintPackageType()
        this.lintTypes()
        this.lintExports()
        this.lintMain()

        this.checkCompleteness()

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

        for (const [name, variable] of Object.entries(this.templateVariables).filter(([, v]) => v.inferOnly !== true)) {
            const config = this.packagejson[this.configurationKey] as PackageConfiguration
            config.template ??= {}
            config.template[name] ??= variable.value
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

    public lintPublishConfig(): void {
        if (this.configuration?.rules?.publishConfig === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'publishConfig', order: 'last' })
    }

    public lintLicense(): void {
        if (this.configuration?.rules?.license === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'license', order: 'last' })
    }

    public lintEngines(): void {
        if (this.configuration?.rules?.engines === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'engines', order: 'last' })
    }

    public lintTypes(): void {
        if (this.configuration?.rules?.types === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'types', order: 'last' })
    }

    public lintMain(): void {
        if (this.configuration?.rules?.main === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'main', order: 'last' })
    }

    public lintExports(): void {
        if (this.configuration?.rules?.exports === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'exports', order: 'last' })
    }

    public lintPackageType(): void {
        if (this.configuration?.rules?.packageType === false) {
            return
        }

        this.lintPackageJsonKey({ key: 'packageType', packageJsonKey: 'type', order: 'last' })
    }

    public lintPackageFiles(): void {
        if (this.configuration?.rules?.files === false) {
            return
        }

        if (!this.packagejson.files) {
            this.packagejson.files = []
        }

        this.lintPackageJsonKey({ key: 'files', order: 'last' })
    }

    public lintScripts(): void {
        if (this.configuration?.rules?.scripts === false) {
            return
        }
        if (!this.packagejson.scripts) {
            this.packagejson.scripts = {}
        }
        const json = JSON.stringify(this.packagejson.scripts)
        for (const [entry, value] of this.getRequiredTemplates({ order: 'last' }).flatMap((l) => {
            return Object.entries(l.scripts ?? {})
        })) {
            this.packagejson.scripts[entry] = value
        }
        this.packagejson.scripts = Object.fromEntries(
            Object.entries(this.packagejson.scripts).filter(([_, value]) => value !== undefined)
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
        if (this.configuration?.rules?.dependencies === false) {
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
        if (this.configuration?.rules?.devDependencies === false) {
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

    public checkCompleteness(): void {
        // if provenance is set to true, check if repository is set
        if (this.packagejson.publishConfig?.provenance === true && this.packagejson.repository === undefined) {
            console.warn('WARNING: publishConfig is set to add provenance but no repository is setup in package.json')
            this.fail()
        }

        // if bin is set, check if files exist
        for (const entry of Object.entries(this.packagejson.bin ?? {})) {
            if (!fs.existsSync(`${process.cwd()}/${entry[1]}`)) {
                console.warn(`WARNING: ${entry[1]} is set as a bin entry for ${entry[0]} but does not exist`)
                this.fail()
            }
        }
    }

    private lintPackageJsonKey({
        key,
        packageJsonKey = key,
        order,
    }: {
        key: keyof ProjectTemplateDefinition
        packageJsonKey?: keyof PackageJson
        order: 'first' | 'last'
    }) {
        const json = JSON.stringify(this.packagejson[packageJsonKey] ?? {})
        let hasValues = false
        for (const value of this.getRequiredTemplates({ order })
            .filter((l) => key in l)
            .map((l) => l[key])) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.packagejson[packageJsonKey] = value as any
            hasValues = true
        }

        if (JSON.stringify(this.packagejson[packageJsonKey] ?? {}) !== json && hasValues) {
            console.warn(
                `[package.json>${packageJsonKey}] missing or outdated configuration found:\n${
                    vdiff(JSON.parse(json), this.packagejson[packageJsonKey]).text
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
