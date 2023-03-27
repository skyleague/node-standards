export interface ProjectTemplateDefinition {
    repositoryUrl?: string | undefined
    scripts?: Record<string, string | undefined> | undefined
    engines?: { node: string } | undefined
    license?: string | undefined
    files?: string[] | undefined
    publishConfig?: {
        registry: string
        access: 'public' | 'restricted'
    }
    dependencies?: Record<string, string | undefined> | undefined
    devDependencies?: Record<string, string | undefined> | undefined
    definition?: Record<string, string> | undefined
    roots: [string, ...string[]]
    links?: string[] | undefined
    extends?: string[] | undefined
}

export interface ProjectTemplateBuilder {
    type: string
    overrides?: string
    template: ProjectTemplateDefinition
}

export type ProjectTemplate = Omit<ProjectTemplateBuilder, 'template'> & { template: ProjectTemplateDefinition }

export type ProjectDefinition = ProjectTemplateDefinition & { type: string }
