import type { ProjectTemplate } from './types'

import { devDependencies, peerDependencies, repositoryUrl, rootDirectory } from '../constants'
import { PackageType } from '../types'

export const CommonTemplate: ProjectTemplate = {
    type: PackageType.Common,
    repositoryUrl,
    scripts: {
        ['prepare']: 'npx husky install || true',
    },
    files: undefined,
    dependencies: undefined,
    devDependencies: {},
    definition: {
        node: '>=14',
    },
    links: undefined,
    roots: [rootDirectory],
}

export const CommonTypescriptTemplate: ProjectTemplate = {
    type: PackageType.CommonTypescript,
    repositoryUrl,
    scripts: {
        ['build']: 'npx ts-node esbuild.config.ts',
        ['build:clean']: 'npx tsc --build --clean && rm .main.js && rm .main.js.map',
        ['build:docs']: 'npx typedoc',
        ['check:cost']: 'npx cost-of-modules --no-install --include-dev',
        ['check:coverage']: 'npx jest --collectCoverage=true',
        ['check:full']: 'npm run lint && npm run check:types && npm run check:coverage && npm run build && npm run check:project',
        ['check:project']: 'npx node-standards lint',
        ['check:types']: 'npx tsc -p tsconfig.json',
        ['fix']: 'npm run lint -- --fix',
        ['format']: 'npx prettier "**/*.{ts,js,json,yml,yaml}" --ignore-path .gitignore --write',
        ['lint:full']: 'bash -c "FULL_LINT=true npm run lint"',
        ['lint']: 'npx eslint "{src,test,typing}/**/*.ts" --no-eslintrc --cache -c .eslintrc.js --ignore-path .gitignore',
        ['package']: 'rm -rf .dist && npm run build',
        ['test']: 'npx jest',
    },
    files: undefined,
    dependencies: {
        tslib: devDependencies['tslib'],
    },
    devDependencies: {
        ...peerDependencies,
    },
    definition: {
        node: '>=14',
    },
    links: [PackageType.Common],
    roots: [rootDirectory],
}
