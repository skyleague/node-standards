import * as commands from './commands'

import { bin } from '../package.json'

import { install } from 'source-map-support'
import type { CommandModule } from 'yargs'
import yargs from 'yargs'

export async function run(): Promise<void> {
    install()

    let cli = yargs.scriptName(Object.keys(bin)[0])
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }

    await cli.demandCommand().strict().help().argv
}
