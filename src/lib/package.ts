import type { PackageJson } from './types'

import fs from 'fs'

export function readPackageJson(): PackageJson {
    return {
        ...(fs.existsSync(`${process.cwd()}/package.json`)
            ? JSON.parse(fs.readFileSync(`${process.cwd()}/package.json`).toString())
            : {}),
    } as PackageJson
}
