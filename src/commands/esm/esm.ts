import glob from 'fast-glob'
import LineDiff from 'line-diff'

import fs from 'fs'
import path from 'path'

export async function fixEsm({
    target,
    dryRun,
    assertJson,
    skipTherefore,
}: {
    target: string
    dryRun: boolean
    assertJson: boolean
    skipTherefore: boolean
}) {
    const entries = await glob('**/*.ts', { cwd: target, dot: true, followSymbolicLinks: false })
    for (const entry of entries) {
        if (entry.endsWith('.d.ts')) {
            continue
        }
        const filePath = path.resolve(target, entry)
        const relativeFilePath = path.relative(process.cwd(), filePath)
        const originalContents = await fs.promises.readFile(filePath, 'utf8')
        const updatedContents = updateEsmImports({
            originalContents,
            assertJson,
            filePath,
            skipTherefore,
        })
        if (updatedContents !== originalContents) {
            console.warn(`[${relativeFilePath}]:\n${new LineDiff(originalContents, updatedContents).toString()}`)
            if (!dryRun) {
                await fs.promises.writeFile(filePath, updatedContents, 'utf8')
            }
        }
    }
}

const importRe = /^(?<imp>(?:import|export)(?:.|\n)*?from ['"]\..*?['"])$/gm

const fromRe = /(from\s+['"])(.*?)(['"])(\s*assert.*)?$/
export function updateEsmImports(
    {
        originalContents,
        assertJson,
        filePath,
        skipTherefore,
    }: {
        originalContents: string
        assertJson: boolean
        skipTherefore: boolean
        filePath: string
    },
    _fs: Pick<typeof fs, 'existsSync'> = fs
) {
    if (skipTherefore && ['.type.ts', '.client.ts'].some((x) => filePath.endsWith(x))) {
        return originalContents
    }
    return originalContents.replaceAll(importRe, (x) => {
        return x.replace(fromRe, (_, a: string, b: string, c: string) => {
            if (b.endsWith('.js')) {
                return `${a}${b}${c}`
            }
            if (b.endsWith('.json') && assertJson) {
                return `${a}${b}${c} assert { type: 'json' }`
            }

            if (_fs.existsSync(path.resolve(path.dirname(filePath), `${b}.ts`))) {
                return `${a}${b}.js${c}`
            } else if (_fs.existsSync(path.resolve(path.dirname(filePath), b, 'index.ts'))) {
                return `${a}${b}/index.js${c}`
            }
            return `${a}${b}${c}`
        })
    })
}
