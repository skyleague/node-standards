export interface PackageConfiguration<PackageType extends string = string> {
    type: PackageType
    template?: {
        exclude?: string[]
        lint?: {
            publishConfig?: boolean
            license?: boolean
            engines?: boolean
            files?: boolean
            dependencies?: boolean
            devDependencies?: boolean
            scripts?: boolean
            definition?: boolean
        }
        documentation?: 'docusaurus' | 'simple'
    }
}

export type PackageJson = Record<string, unknown> & {
    version: string
    license: string | undefined
    publishConfig: { registry: string; access: 'public' | 'restricted' } | undefined
    scripts: Record<string, string | undefined> | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    files: string[] | undefined
    ['node-standards']: PackageConfiguration | undefined
}
