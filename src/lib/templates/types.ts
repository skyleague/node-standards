export interface ProjectTemplateDefinition {
    repositoryUrl?: string | undefined
    scripts?: Record<string, string | undefined> | undefined
    engines?: { node: string } | undefined
    license?: string | undefined
    files?: string[] | undefined
    publishConfig?: {
        registry: string
        access: 'public' | 'restricted'
        provenance?: boolean
    }
    dependencies?: Record<string, string | undefined> | undefined
    devDependencies?: Record<string, string | undefined> | undefined
    roots: [string, ...string[]]
    links?: string[] | undefined
    extends?: string[] | undefined
    packageType?: 'commonjs' | 'module' | undefined
    exports?: Record<string, string | undefined> | undefined
    main?: string | undefined
    types?: string | undefined
}

export interface ProjectTemplateBuilder {
    type: string
    overrides?: string
    template: ProjectTemplateDefinition
}

export type ProjectTemplate = Omit<ProjectTemplateBuilder, 'template'> & { template: ProjectTemplateDefinition }

export type ProjectDefinition = ProjectTemplateDefinition & { type: string }
