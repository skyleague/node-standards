import enquirer from 'enquirer'

export type PromptOptions = Omit<Parameters<typeof enquirer.prompt>[0], 'name'>

export interface ProjectTemplateVariable {
    /// if we find this literal in a file we assume we can replace it
    literal?: string
    value?: string
    prompt: PromptOptions
}

export interface ProjetTemplateLiteral {
    literal: string
}

export interface ProjectTemplateVariables {
    package_name: ProjectTemplateVariable
    project_name: ProjectTemplateVariable
    [key: string]: ProjectTemplateVariable | undefined
}

export type EvaluatedProjectTemplateVariable = Omit<ProjectTemplateVariable, 'value'> & { value: string }
export interface EvaluatedProjectTemplateVariables {
    package_name: EvaluatedProjectTemplateVariable
    project_name: EvaluatedProjectTemplateVariable
    [key: string]: EvaluatedProjectTemplateVariable
}

export async function evaluateProjectTemplateVariables(
    variables: ProjectTemplateVariables
): Promise<EvaluatedProjectTemplateVariables> {
    const answers = await enquirer.prompt(
        Object.entries(variables).map(([key, value]) => ({
            name: key,
            type: 'input',
            message: `What is the ${key}?`,
            ...value?.prompt,
        }))
    )

    for (const [key, answer] of Object.entries(answers)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        variables[key]!.value = answer as string
    }
    return variables as EvaluatedProjectTemplateVariables
}
