import { fixVitest } from './vitest.js'

import type { Argv } from 'yargs'

import path from 'node:path'

export function builder(yargs: Argv): Argv<{ fix: boolean; target: (number | string)[] }> {
    return yargs
        .option('fix', {
            describe: 'try to fix the errors',
            type: 'boolean',
            default: false,
        })
        .option('target', {
            alias: 't',
            describe: 'set target directory',
            type: 'array',
            default: ['src', 'test'],
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { fix, target } = await argv

    await fixVitest({
        target: target.map((x) => path.resolve(x.toString(), process.cwd())),
        dryRun: !fix,
    })
}

export default {
    command: 'vitest',
    describe: 'lint the project to convert jest to vitest',
    builder,
    handler,
}
