import glob from 'fast-glob'
import LineDiff from 'line-diff'

import fs from 'fs'
import path from 'path'

const re = /(?<imp>(?:import|export)\s+.*?\s+from\s+['"].*?['"](?:\s*assert.*)?)/gm
export async function fixEsm({ target, dryRun, assertJson }: { target: string; dryRun: boolean; assertJson: boolean }) {
    const entries = await glob('**/*.ts', { cwd: target, dot: true, followSymbolicLinks: false })
    for (const entry of entries) {
        if (entry.endsWith('.d.ts')) {
            continue
        }
        const filePath = path.resolve(target, entry)
        const relativeFilePath = path.relative(process.cwd(), filePath)
        const originalContents = await fs.promises.readFile(filePath, 'utf8')
        const updatedContents = originalContents.replaceAll(re, (x) => {
            return x.replace(/(from\s+['"])(\..*?)(['"])(\s*assert.*)?/, (_, a: string, b: string, c: string) => {
                if (b.endsWith('.js')) {
                    return `${a}${b}${c}`
                }
                if (b.endsWith('.json') && assertJson) {
                    return `${a}${b}${c} assert { type: 'json' }`
                }

                if (fs.existsSync(path.resolve(path.dirname(filePath), `${b}.ts`))) {
                    return `${a}${b}.js${c}`
                } else if (fs.existsSync(path.resolve(path.dirname(filePath), b, 'index.ts'))) {
                    return `${a}${b}/index.js${c}`
                }
                return `${a}${b}${c}`
            })
        })
        if (updatedContents !== originalContents) {
            console.warn(`[${relativeFilePath}]:\n${new LineDiff(originalContents, updatedContents).toString()}`)
            if (!dryRun) {
                await fs.promises.writeFile(filePath, updatedContents, 'utf8')
            }
        }
    }
}
