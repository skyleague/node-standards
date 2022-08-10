import type { Argv } from 'yargs'

export function builder(yargs: Argv): Argv<{ name: string; file: unknown }> {
    return yargs
        .option('name', {
            describe: 'name to print',
            type: 'string',
            default: 'world',
        })
        .positional('file', {})
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<number> {
    console.log(`goodbye ${(await argv).name} from ./src/commands/goodbye.ts`)
    return Promise.resolve(0)
}

export default {
    command: 'goodbye [file]',
    describe: 'describe the command here',
    builder,
    handler,
}
