import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/index.js'

import type { Argv } from 'yargs'

export function builder(yargs: Argv) {
    return yargs
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
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string } = {}
): Promise<void> {
    const { fix, directory, forceVarStorage } = await argv

    await new ProjectLinter({
        cwd: directory,
        forceVarStorage,
        configurationKey,
        templates,
        fix,
    }).lint()
}

export default {
    command: 'lint',
    describe: 'Analyze project config for errors or deviations from best practices.',
    builder,
    handler,
}
