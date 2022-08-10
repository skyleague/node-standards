import fs from 'fs'
import path from 'path'

export function getAllFiles(dirPath: string): string[] {
    const result: string[] = []
    function getAllFilesImpl(dir: string, store: string[]): void {
        for (const file of fs.readdirSync(dir)) {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            if (stat.isDirectory()) {
                getAllFilesImpl(filePath, store)
            } else {
                store.push(filePath)
            }
        }
    }
    getAllFilesImpl(dirPath, result)
    return result
}
