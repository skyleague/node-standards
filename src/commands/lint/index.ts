import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/index.js'

import yargs from 'yargs'
import type { Argv } from 'yargs'
import { hideBin } from 'yargs/helpers'

export function builder(y: Argv) {
    return y
        .option('fix', {
            describe: 'Auto-correct detected errors if not provided, only report.',
            type: 'boolean',
            default: false,
        })
        .option('force-var-storage', {
            alias: 'fvs',
            describe: 'Enforce variable storage in package.json',
            type: 'boolean',
            default: false,
        })
        .option('directory', {
            alias: 'C',
            describe: 'Set working directory for package linting.',
            type: 'string',
            normalize: true,
            default: './',
        })
        .strict(false)
}

export async function handler(
    argv: ReturnType<typeof builder>['argv'],
    {
        templates = ossTemplates,
        configurationKey = 'node-standards',
        command: projectCommand = command,
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string; command?: typeof command } = {},
): Promise<void> {
    const { fix, directory, forceVarStorage } = await argv

    const project = new ProjectLinter({
        cwd: directory,
        forceVarStorage,
        configurationKey,
        templates,
        fix,
    })

    await yargs(hideBin(process.argv)).command({
        ...projectCommand,
        builder: (y) => project.builder(projectCommand.builder(y)).strict(true).help(),
        handler: async (_argv) => project.lint({ argv: _argv as Record<string, string> }),
    }).argv
}

export const command = {
    command: 'lint',
    describe: 'Analyze project config for errors or deviations from best practices.',
    builder,
    handler,
}
export default command
