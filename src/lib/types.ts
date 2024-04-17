import type { PackageConfiguration } from '../config/config.type.js'

export type PackageJson = Record<string, unknown> & {
    name: string | undefined
    bin: Record<string, string> | undefined
    exports: Record<string, string | undefined> | undefined
    version: string
    license: string | undefined
    publishConfig: { registry: string; access: 'public' | 'restricted'; provenance?: boolean } | undefined
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    'node-standards': PackageConfiguration | undefined
}
