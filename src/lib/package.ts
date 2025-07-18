import fs from 'node:fs'
import type { PackageJson } from './types.js'

export function readPackageJson({ cwd = process.cwd() }: { cwd?: string } = {}): PackageJson {
    return {
        ...(fs.existsSync(`${cwd}/package.json`) ? JSON.parse(fs.readFileSync(`${cwd}/package.json`).toString()) : {}),
    } as PackageJson
}
