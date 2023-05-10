import { spawn, isIgnored } from '../../common/index.js'
import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { EvaluatedProjectTemplateVariables } from '../../lib/template.js'
import { evaluateProjectTemplateVariables } from '../../lib/template.js'
import type { ProjectTemplateBuilder, ProjectTemplateDefinition } from '../../lib/templates/types.js'

import fg from 'fast-glob'
import pLimit from 'p-limit'
import type { Argv } from 'yargs'

import { promises, mkdirSync, existsSync } from 'node:fs'
import path, { dirname, join } from 'node:path'

export function replaceTemplateVariables(template: EvaluatedProjectTemplateVariables, content: string) {
    for (const [key, { value, literal }] of Object.entries(template)) {
        content = content.replace(new RegExp(`__${key}(__w+)?__`, 'g'), value)
        if (literal !== undefined) {
            content = content.replace(new RegExp(literal, 'g'), value)
        }
    }
    return content
}

export async function createProject({
    type,
    template,
    templateVariables,
}: {
    type: string
    template: ProjectTemplateDefinition
    templateVariables: EvaluatedProjectTemplateVariables
}): Promise<void> {
    const targetDir = path.resolve(process.cwd(), templateVariables.project_name.value)
    const fromDir = path.join(template.roots[0], `examples/${type}`)

    await spawn('git', ['init', targetDir, '-b', 'main'])

    console.log(`Creating a new project in ${targetDir}.`)

    const limit = pLimit(255)

    const entries = await fg('**/*', { dot: true, cwd: fromDir, followSymbolicLinks: false, ignore: ['**/node_modules/**'] })

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

                    const content = await promises.readFile(join(fromDir, f), 'utf8')

                    const newContent = replaceTemplateVariables(templateVariables, content)

                    return promises.writeFile(join(targetDir, f), newContent, 'utf8')
                }
                return
            })
        )
    )
}

export function builder(
    yargs: Argv,
    _ = null,
    { templates }: { templates: [string, ...string[]] } = { templates: ['library', 'yargs-cli'] }
): Argv<{ name: string | undefined; type: string }> {
    return yargs
        .option('type', {
            describe: 'package type',
            type: 'string',
            default: templates[0],
            choices: templates,
            demand: true,
        })
        .positional('name', {
            describe: 'the new package name',
            type: 'string',
            required: true,
        })
}

export async function handler(
    argv: ReturnType<typeof builder>['argv'],
    {
        templates = ossTemplates,
        configurationKey = 'node-standards',
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string } = {}
): Promise<void> {
    const { type, name } = await argv

    const linter = {
        templates: templates,
        configurationKey,
        configuration: {
            extends: type,
        },
        cwd: `${process.cwd()}/${name!}`,
        fix: true,
    }
    const project = new ProjectLinter(linter)

    if (project.layers === undefined) {
        throw new Error(`Could not find a template with type ${type}`)
    }

    const templateVariables = project.projectTemplateVariables(name!)
    const evaluatedProjectTemplateVariables = await evaluateProjectTemplateVariables(templateVariables)

    await createProject({ type, template: project.layers[0]!, templateVariables: evaluatedProjectTemplateVariables })

    new ProjectLinter({ ...linter, configuration: undefined }).lint({ throwOnFail: false })
}

export default {
    command: 'create <name>',
    describe: 'create a new project',
    builder,
    handler,
}
