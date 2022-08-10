import type { Argv } from 'yargs'

export function builder(yargs: Argv): Argv<{ name: string; force: boolean | undefined; file: string | undefined }> {
    return yargs
        .option('name', {
            describe: 'name to print',
            type: 'string',
            default: 'world',
        })
        .option('force', {
            type: 'boolean',
        })
        .positional('file', {
            type: 'string',
        })
}

export async function handler(argv: ReturnType<typeof builder>['argv']): Promise<void> {
    const { name, force, file } = await argv
    console.log(`hello ${name} from ./src/commands/hello.ts`)
    if (file !== undefined && force) {
        console.log(`you input --force and --file: ${file}`)
    }
}

export default {
    command: 'hello [file]',
    describe: 'describe the command here',
    builder,
    handler,
}
