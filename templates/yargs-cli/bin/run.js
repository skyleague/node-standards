#!/usr/bin/env node
import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { hideBin } from 'yargs/helpers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const project = path.join(__dirname, '../tsconfig.json')
const dev = fs.existsSync(project) && process.env.DEBUG != 'false'

if (dev) {
    await new Promise((resolve, reject) => {
        const res = execFile(
            'npx',
            ['ts-node-esm', '-T', path.join(__dirname, 'run.ts'), ...hideBin(process.argv)],
            { stdio: 'inherit', cwd: process.cwd() },
            (err, stdout, stderr) => {
                if (err) {
                    console.error(err)
                    reject(process.exit(err.code))
                } else {
                    resolve({ stdout, stderr })
                }
            }
        )
        res.stdout.pipe(process.stdout)
        res.stderr.pipe(process.stderr)
    })
    process.exit(0)
}

const { run } = await import('../dist/index.js')
await run().catch(console.error)
