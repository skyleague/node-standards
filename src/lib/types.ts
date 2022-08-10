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
            files?: boolean
            dependencies?: boolean
            devDependencies?: boolean
            script?: boolean
            definition?: boolean
        }
    }
}

export type PackageJson = Record<string, unknown> & {
    version: string
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    ['node-standards']: PackageConfiguration | undefined
}
