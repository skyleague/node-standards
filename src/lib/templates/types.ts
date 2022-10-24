import type { PackageConfiguration } from '../types'

export interface ProjectTemplateDefinition {
    repositoryUrl: string | undefined
    scripts: Record<string, string | undefined> | undefined
    files: string[] | undefined
    publishConfig?: {
        registry: string
        access: 'public' | 'restricted'
    }
    dependencies: Record<string, string | undefined> | undefined
    devDependencies: Record<string, string | undefined> | undefined
    definition: Record<string, string> | undefined
    links: string[] | undefined
    roots: [string, ...string[]]
}

export interface ProjectTemplateBuilder {
    type: string
    overrides?: string
    template: ProjectTemplateDefinition | ((config?: PackageConfiguration) => ProjectTemplateDefinition)
}

export type ProjectTemplate = Omit<ProjectTemplateBuilder, 'template'> & { template: ProjectTemplateDefinition }

export type ProjectDefinition = ProjectTemplateDefinition & { type: string }
