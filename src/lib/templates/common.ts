import type { ProjectTemplate, ProjectTemplateBuilder } from './types'

import { dependencies, peerDependencies, repositoryUrl, rootDirectory } from '../constants'

export const CommonTemplate: ProjectTemplate = {
    type: 'common',
    template: {
        repositoryUrl,
        scripts: {
            ['prepare']: 'npx husky install || true',
        },
        devDependencies: {},
        definition: {
            node: '>=14',
        },
        roots: [rootDirectory],
    },
}

export const CommonTypescriptTemplate: ProjectTemplateBuilder = {
    type: 'common-typescript',
    template: () => ({
        repositoryUrl,
        engines: {
            node: '>=18',
        },
        scripts: {
            ['build']: 'npx ts-node build.config.ts',
            ['build:clean']: 'npx tsc --build --clean && rm .main.js && rm .main.js.map',
            ['build:docs']: 'npx typedoc',
            ['check:cost']: 'npx cost-of-modules --no-install --include-dev',
            ['check:coverage']: 'npx jest --collectCoverage=true',
            ['check:full']:
                'npm run lint && npm run check:types && npm run check:coverage && npm run build && npm run check:project',
            ['check:project']: 'npx node-standards lint',
            ['check:types']: 'npx tsc -p tsconfig.json',
            ['fix']: undefined,
            ['format']: 'npx prettier "**/*.{ts,js,json,yml,yaml,md}" --ignore-path .gitignore --write',
            ['lint:full']: 'bash -c "FULL_LINT=true npm run lint"',
            ['lint:fix']: 'npm run lint -- --fix',
            ['lint']: 'npx eslint "{src,test,typing}/**/*.ts" --no-eslintrc --cache -c .eslintrc.js --ignore-path .gitignore',
            ['package']: 'rm -rf .dist && npm run build',
            ['test']: 'npx jest',
        },
        dependencies: {
            tslib: dependencies.tslib,
        },
        devDependencies: {
            ...peerDependencies,
            tslib: undefined,
        },
        definition: {
            node: '>=14',
        },
        roots: [rootDirectory],
        links: ['common'],
    }),
}
