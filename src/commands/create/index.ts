import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/types.js'

import type { Argv } from 'yargs'

export function builder(
    yargs: Argv,
    _ = null,
    { templates }: { templates: [string, ...string[]] } = { templates: ['library', 'yargs-cli'] }
) {
    return yargs
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
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string } = {}
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

    await project.create({ type, targetDir: linter.cwd })

    // clean linter configuration
    await new ProjectLinter({ ...linter, configuration: undefined }).lint({ throwOnFail: false })
}

export default {
    command: 'create <name>',
    describe: 'Initiate creation of a new project with the provided name.',
    builder,
    handler,
}
