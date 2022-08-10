import * as commands from './commands'
export * from './lib'
export * from './commands'

import { bin } from '../package.json'

import { install } from 'source-map-support'
import type { CommandModule } from 'yargs'

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/consistent-type-imports, @typescript-eslint/no-var-requires
const yargs: typeof import('yargs') = require('yargs')

export async function run(): Promise<void> {
    install()

    let cli = yargs.scriptName(Object.keys(bin)[0] ?? 'cli')
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }
    await cli.demandCommand().strict().help().argv
}
