import { peerDependencies, devDependencies, dependencies, version, repository } from '../../package.json'

import findRoot from 'find-root'

const [, repositoryUrl] = /(https:\/\/.*?)(?:\.git)?$/.exec(repository.url) ?? []
export { peerDependencies, devDependencies, dependencies, version, repository, repositoryUrl }
export const rootDirectory = findRoot(__dirname)
