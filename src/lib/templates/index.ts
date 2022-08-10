import { CommonTemplate, CommonTypescriptTemplate } from './common'
import { LibraryTemplate } from './library'
import type { ProjectTemplate } from './types'
import { YargsCliTemplate } from './yargs-cli'
export { CommonTemplate } from './common'
export { LibraryTemplate } from './library'
export { YargsCliTemplate } from './yargs-cli'
export { ProjectTemplate } from './types'

export const templates = [CommonTemplate, CommonTypescriptTemplate, LibraryTemplate, YargsCliTemplate]

export function getTemplate(
    xs: ProjectTemplate[],
    type: string | undefined,
    { allowOverrides = true }: { allowOverrides?: boolean } = {}
): ProjectTemplate | undefined {
    if (type === undefined) {
        return undefined
    }

    return xs.find((x) => x.type === type || (allowOverrides && x.overrides === type))
}
