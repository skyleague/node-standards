import { fixEsm } from './esm.js'

import type { Argv } from 'yargs'

import path from 'node:path'

export function builder(yargs: Argv): Argv<{ fix: boolean; target: string; 'assert-json': boolean; 'skip-therefore': boolean }> {
    return yargs
        .option('fix', {
            describe: 'try to fix the errors',
            type: 'boolean',
            default: false,
        })
        .option('assert-json', {
            describe: 'add assertions to JSON imports',
            type: 'boolean',
            default: true,
        })
        .option('skip-therefore', {
            describe: 'skip therefore files',
            type: 'boolean',
            default: true,
        })
        .option('target', {
            alias: 't',
            describe: 'set target directory',
            type: 'string',
            default: 'src',
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { fix, target, assertJson, skipTherefore } = await argv

    await fixEsm({
        target: path.resolve(process.cwd(), target),
        dryRun: !fix,
        assertJson,
        skipTherefore,
    })
}

export default {
    command: 'esm',
    describe: 'lint the project for potential ESM import issues',
    builder,
    handler,
}
