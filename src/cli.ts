import type { CommandModule } from 'yargs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import packageJson from '../package.json' with { type: 'json' }
import * as commands from './commands/index.js'

export async function run(): Promise<void> {
    let cli = yargs(hideBin(process.argv)).scriptName(Object.keys(packageJson.bin)[0] ?? 'cli')
    for (const command of Object.values(commands)) {
        cli = cli.command(command.default as unknown as CommandModule)
    }
    await cli.demandCommand().strict().help().argv
}
