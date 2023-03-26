import type { AnyPackageConfiguration } from '../config/config.type'

export type PackageJson = Record<string, unknown> & {
    version: string
    license: string | undefined
    publishConfig: { registry: string; access: 'public' | 'restricted' } | undefined
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    ['node-standards']: AnyPackageConfiguration | undefined
}
