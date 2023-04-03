import * as commands from './commands/index.js'
export * from './config/index.js'
export * from './lib/index.js'
export * from './commands/index.js'

import packageJson from '../package.json' assert { type: 'json' }

import { install } from 'source-map-support'
import type { CommandModule } from 'yargs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

export async function run(): Promise<void> {
    install()

    let cli = yargs(hideBin(process.argv)).scriptName(Object.keys(packageJson.bin ?? {})[0] ?? 'cli')
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }
    await cli.demandCommand().strict().help().argv
}
