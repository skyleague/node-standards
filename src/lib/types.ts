export enum PackageType {
    Common = 'common',
    CommonTypescript = 'common-typescript',
    Library = 'library',
    YargsCli = 'yargs-cli',
}

export interface PackageConfiguration {
    type: PackageType
    template?: {
        exclude?: string[]
        lint?: {
            publishConfig?: boolean
            files?: boolean
            dependencies?: boolean
            devDependencies?: boolean
            scripts?: boolean
            definition?: boolean
        }
    }
}

export type PackageJson = Record<string, unknown> & {
    version: string
    publishConfig: { registry: string; access: 'public' | 'restricted' } | undefined
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    ['node-standards']: PackageConfiguration | undefined
}
