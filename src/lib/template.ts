import type { PackageJson } from './types.js'

import type enquirer from 'enquirer'

export type PromptOptions = Omit<Parameters<typeof enquirer.prompt>[0], 'name'>

export interface ProjectTemplateVariable {
    /// if we find this literal in a file we assume we can replace it
    value?: string | undefined
    prompt: PromptOptions
    literal: string | string[]
    skipStore?: boolean | undefined
    infer?: ((options: { packagejson: PackageJson; cwd: string }) => string | undefined) | undefined
    render?: (options: { content: string; value: string; literal: string }) => string
}

export interface ProjectTemplateVariables {
    packageName: Partial<ProjectTemplateVariable>
    projectName: Partial<ProjectTemplateVariable>
    [key: string]: Partial<ProjectTemplateVariable>
}
