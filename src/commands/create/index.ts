import { spawn, isIgnored } from '../../common'
import { Project } from '../../lib/project'
import { templates } from '../../lib/templates'
import type { ProjectTemplateDefinition } from '../../lib/templates/types'

import fg from 'fast-glob'
import pLimit from 'p-limit'
import type { Argv } from 'yargs'

import { promises, mkdirSync, existsSync } from 'fs'
import path, { dirname, join } from 'path'

export async function createProject({
    type,
    name,
    template,
}: {
    type: string
    name: string
    template: ProjectTemplateDefinition
}): Promise<void> {
    const targetDir = path.resolve(process.cwd(), name)
    const fromDir = path.join(template.roots[0], `examples/${type}`)

    await spawn('git', ['init', targetDir])

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
            limit(() => {
                if (!isIgnored(f, { cwd: targetDir })) {
                    console.log(`Copying ${f}`)
                    return promises.copyFile(join(fromDir, f), join(targetDir, f))
                }
                return
            })
        )
    )
}

export function builder(yargs: Argv): Argv<{ name: string | undefined; type: string }> {
    return yargs
        .option('type', {
            describe: 'package type',
            type: 'string',
            default: 'library',
            choices: ['library', 'yargs-cli'],
            demand: true,
        })
        .positional('name', {
            describe: 'the new package name',
            type: 'string',
            required: true,
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { type, name } = await argv

    const project = new Project({
        templates,
    })
    const template = project.template

    if (template === undefined) {
        throw new Error(`could not find a template with type ${type}`)
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await createProject({ type, name: name!, template })
}

export default {
    command: 'create <name>',
    describe: 'create a new project',
    builder,
    handler,
}
