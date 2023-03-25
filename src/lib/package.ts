import type { PackageJson } from './types.js'

import fs from 'fs'

export function readPackageJson({ cwd = process.cwd() }: { cwd?: string } = {}): PackageJson {
    return {
        ...(fs.existsSync(`${cwd}/package.json`) ? JSON.parse(fs.readFileSync(`${cwd}/package.json`).toString()) : {}),
    } as PackageJson
}
