import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/types.js'

import yargs from 'yargs'
import type { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'

export function builder(
    y: Argv,
    _ = null,
    { templates }: { templates: [string, ...string[]] } = { templates: ['library', 'yargs-cli'] }
) {
    return y
        .option('type', {
            describe: 'Specify package type to determine creation template.',
            type: 'string',
            default: templates[0],
            choices: templates,
            demand: true,
        })
        .positional('name', {
            describe: 'Unique name for the new package.',
            type: 'string',
            required: true,
        })
        .option('directory', {
            alias: 'C',
            describe: 'Directory for package creation.',
            type: 'string',
            normalize: true,
        })
        .strict(false)
}

export async function handler(
    argv: ReturnType<typeof builder>['argv'],
    {
        templates = ossTemplates,
        configurationKey = 'node-standards',
        command: projectCommand = command,
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string; command?: typeof command } = {}
): Promise<void> {
    const { type, name, directory } = await argv

    const linter = {
        templates: templates,
        configurationKey,
        name: name!,
        configuration: {
            extends: type,
        },
        cwd: directory ?? `${process.cwd()}/${name!}`,
        fix: true,
    }
    const project = new ProjectLinter(linter)

    if (project.layers === undefined) {
        throw new Error(`Could not find a template with type ${type}`)
    }

    await yargs(hideBin(process.argv)).command({
        ...projectCommand,
        builder: (y) => project.builder(projectCommand.builder(y)).strict(true).help(),
        handler: async (_argv) => project.create({ type, targetDir: linter.cwd, argv: _argv as Record<string, string> }),
    }).argv

    // clean linter configuration
    await new ProjectLinter({ ...linter, configuration: undefined }).lint({ throwOnFail: false })
}

export const command = {
    command: 'create <name>',
    describe: 'Initiate creation of a new project with the provided name.',
    builder,
    handler,
}

export default command
