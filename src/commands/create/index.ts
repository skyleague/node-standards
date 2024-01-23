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
        .strict(false)
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
        name: name!,
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

    await project.create({ type, targetDir: linter.cwd })

    // clean linter configuration
    await new ProjectLinter({ ...linter, configuration: undefined }).lint({ throwOnFail: false })
}

export default {
    command: 'create <name>',
    describe: 'create a new project',
    builder,
    handler,
}
