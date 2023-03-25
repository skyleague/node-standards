import { templates as ossTemplates } from '../../lib/index.js'
import { ProjectLinter } from '../../lib/linter.js'
import type { ProjectTemplateBuilder } from '../../lib/templates/index.js'

import type { Argv } from 'yargs'

export function builder(yargs: Argv): Argv<{ fix: boolean }> {
    return yargs.option('fix', {
        describe: 'try to fix the errors',
        type: 'boolean',
        default: false,
    })
}

export async function handler(
    argv: ReturnType<typeof builder>['argv'],
    {
        templates = ossTemplates,
        configurationKey = 'node-standards',
    }: { templates?: readonly ProjectTemplateBuilder[]; configurationKey?: string } = {}
): Promise<void> {
    const { fix } = await argv

    new ProjectLinter({
        configurationKey,
        templates,
        fix,
    }).lint()
}

export default {
    command: 'lint',
    describe: 'lint the project configuration',
    builder,
    handler,
}
