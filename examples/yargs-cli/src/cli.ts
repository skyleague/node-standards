import * as commands from './commands/index.js'

import packageJSON from '../package.json' with { type: 'json' }

import type { CommandModule } from 'yargs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export async function run(): Promise<void> {
    let cli = yargs(hideBin(process.argv)).scriptName(Object.keys(packageJSON.bin)[0] ?? 'cli')
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }

    await cli.demandCommand().strict().help().argv
}
