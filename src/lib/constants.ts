import packageJson from '../../package.json' with { type: 'json' }

import findRoot from 'find-root'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { peerDependencies, devDependencies, dependencies, version, repository } = packageJson
const [, repositoryUrl] = /(https:\/\/.*?)(?:\.git)?$/.exec(repository.url) ?? []
export { peerDependencies, devDependencies, dependencies, version, repository, repositoryUrl }
export const rootDirectory = (() => {
    let root = findRoot(path.dirname(fileURLToPath(import.meta.url)))

    // If the root is the dist directory, we're in a production build
    if (root.endsWith('.dist')) {
        // So we need to go up one more level
        root = findRoot(path.dirname(root))
    }
    return root
})()
