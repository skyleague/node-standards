import { ProjectLinter } from './lint'

import { templates as allTemplates } from '../../lib/templates'

import type { Argv } from 'yargs'
export { ProjectLinter } from './lint'

export function builder(yargs: Argv): Argv<{ fix: boolean }> {
    return yargs.option('fix', {
        describe: 'try to fix the errors',
        type: 'boolean',
        default: false,
    })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { fix } = await argv

    new ProjectLinter({
        templates: allTemplates,
        fix,
    }).lint()
}

export default {
    command: 'lint',
    describe: 'lint the project configuration',
    builder,
    handler,
}
