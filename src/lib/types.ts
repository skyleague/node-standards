import type { AnyPackageConfiguration } from '../config/config.type.js'

export type PackageJson = Record<string, unknown> & {
    bin: Record<string, string> | undefined
    version: string
    license: string | undefined
    publishConfig: { registry: string; access: 'public' | 'restricted'; provenance?: boolean } | undefined
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    ['node-standards']: AnyPackageConfiguration | undefined
}
