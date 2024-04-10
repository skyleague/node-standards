import type { SpawnOptions } from 'node:child_process'
import { spawn as cbSpawn } from 'node:child_process'

export async function spawn(
    command: string,
    args: readonly string[],
    options?: SpawnOptions,
): Promise<{ exitCode: number | null; stdout: string | undefined }> {
    return new Promise((resolve, reject) => {
        const subprocess = cbSpawn(command, args, { ...options, shell: true })

        subprocess.on('exit', (code) => {
            resolve({ exitCode: code, stdout: subprocess.stdout?.toString() })
        })
        process.on('error', (err) => {
            console.error(err)
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err)
        })
    })
}
