export interface ProjectTemplate {
    type: string
    repositoryUrl: string | undefined
    scripts: Record<string, string | undefined> | undefined
    files: string[] | undefined
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    definition: Record<string, string> | undefined
    links: string[] | undefined
    roots: [string, ...string[]]
    overrides?: string
}
