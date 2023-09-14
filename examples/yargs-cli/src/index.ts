import * as commands from './commands/index.js'

import packageJson from '../package.json' assert { type: 'json' }

import type { CommandModule } from 'yargs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const { bin } = packageJson

export async function run(): Promise<void> {
    let cli = yargs(hideBin(process.argv)).scriptName(Object.keys(bin)[0]!)
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }

    await cli.demandCommand().strict().help().argv
}
