import glob from 'fast-glob'
import LineDiff from 'line-diff'

import fs from 'node:fs'
import path from 'node:path'

export async function fixVitest({ target, dryRun }: { target: string[]; dryRun: boolean }) {
    for (const t of target) {
        const entries = await glob('**/*.spec.ts', { cwd: t, followSymbolicLinks: false })
        for (const entry of entries) {
            if (entry.endsWith('.d.ts')) {
                continue
            }
            const filePath = path.resolve(t, entry)
            const relativeFilePath = path.relative(process.cwd(), filePath)
            const originalContents = await fs.promises.readFile(filePath, 'utf8')
            const updatedContents = updateJestUsage({
                originalContents,
            })
            if (updatedContents !== originalContents) {
                console.warn(`[${relativeFilePath}]:\n${new LineDiff(originalContents, updatedContents).toString()}`)
                if (!dryRun) {
                    await fs.promises.writeFile(filePath, updatedContents, 'utf8')
                }
            }
        }
    }
}
export function updateJestUsage(
    {
        originalContents,
    }: {
        originalContents: string
    },
    _fs: Pick<typeof fs, 'existsSync'> = fs
) {
    const vitestImports = new Set<string>()
    const testReplaced = originalContents
        .replaceAll(/test\(/gm, () => {
            vitestImports.add('it')
            return 'it('
        })
        .replaceAll(/test.each/gm, () => {
            vitestImports.add('it')
            return 'it.each'
        })
    const jestFnReplaced = testReplaced
        .replaceAll(/jest\.fn\(/gm, () => {
            vitestImports.add('vi')
            return 'vi.fn('
        })
        .replaceAll(/jest\.mock\(/gm, () => {
            vitestImports.add('vi')
            return 'vi.mock('
        })
        .replaceAll(/jest\.spyOn\(/gm, () => {
            vitestImports.add('vi')
            return 'vi.spyOn('
        })
        .replaceAll(/jest\.restoreAllMocks\(/gm, () => {
            vitestImports.add('vi')
            return 'vi.restoreAllMocks('
        })

    if ((originalContents.match(/expect\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('expect')
    }
    if ((originalContents.match(/describe\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('describe')
    }
    if ((originalContents.match(/beforeEach\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('beforeEach')
    }
    if ((originalContents.match(/beforeAll\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('beforeAll')
    }
    if ((originalContents.match(/afterEach\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('afterEach')
    }
    if ((originalContents.match(/afterAll\(/gm)?.length ?? 0) > 0) {
        vitestImports.add('afterAll')
    }
    const importReplaced = jestFnReplaced.replaceAll(/import\s+({.*?})\s+from\s+['"]vitest['"]\s*/gm, (_, group) => {
        for (const g of (group as string).split(',')) {
            vitestImports.add(g.replaceAll('{', '').replaceAll(/[{}]/g, '').trim())
        }
        return ''
    })
    const vitestImport = vitestImports.size > 0 ? `import { ${[...vitestImports].join(', ')} } from 'vitest'\n` : ''

    return `${vitestImport}${importReplaced}`
}
