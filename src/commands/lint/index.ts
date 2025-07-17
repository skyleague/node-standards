import type { Argv } from 'yargs'
import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/index.js'

export function builder(yargs: Argv) {
    return yargs
        .option('fix', {
            describe: 'Auto-correct detected errors if not provided, only report.',
            type: 'boolean',
            default: false,
        })
        .option('force', {
            describe: 'Force template updates even for files marked with provisionNewOnly (+).',
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
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string } = {},
): Promise<void> {
    const { fix, force, directory } = await argv

    new ProjectLinter({
        cwd: directory,
        configurationKey,
        templates,
        fix,
        force,
    }).lint()
}

export default {
    command: 'lint',
    describe: 'lint the project configuration',
    builder,
    handler,
}
