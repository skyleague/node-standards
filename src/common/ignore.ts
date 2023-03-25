import { rootDirectory } from '../lib/constants.js'

import type { SpawnSyncReturns } from 'child_process'
import { execSync } from 'child_process'

export function isIgnored(file: string, { cwd = rootDirectory }: { cwd?: string } = {}): boolean {
    try {
        return execSync(`git check-ignore ${file}`, { cwd }).toString().includes(file)
    } catch (error) {
        return (error as SpawnSyncReturns<string>).status === 0
    }
}
