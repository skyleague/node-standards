import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/index.js'

import type { Argv } from 'yargs'

export function builder(yargs: Argv) {
    return yargs
        .option('fix', {
            describe:
                'Automatically attempt to correct any detected errors. If this option is not provided, the program will only report errors without fixing them.',
            type: 'boolean',
            default: false,
        })
        .option('force-var-storage', {
            alias: 'fvs',
            describe: 'Enforce variable storage in the package.json file',
            type: 'boolean',
            default: false,
        })
        .option('directory', {
            alias: 'C',
            describe: 'Define the current working directory where the package will be created.',
            type: 'string',
            normalize: true,
            default: './',
        })
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
    describe:
        'Analyze the project configuration for potential errors or deviations from best practices. This command helps maintain the quality and consistency of your project configuration.',
    builder,
    handler,
}
