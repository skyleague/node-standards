import type { ProjectTemplate, ProjectTemplateBuilder } from './types.js'

import { dependencies, peerDependencies, repositoryUrl, rootDirectory } from '../constants.js'

export const CommonTemplate: ProjectTemplate = {
    type: 'common',
    template: {
        repositoryUrl,
        scripts: {
            ['prepare']: 'npx husky install || true',
        },
        roots: [rootDirectory],
    },
}

export const CommonTypescriptTemplate: ProjectTemplateBuilder = {
    type: 'common-typescript',
    template: {
        repositoryUrl,
        engines: {
            node: '>=18',
        },
        scripts: {
            ['build']: 'npx ts-node --esm build.config.ts',
            ['build:clean']: 'npx tsc --build --clean && rm -rf dist',
            ['build:docs']: 'npx typedoc',
            ['check:cost']: 'npx cost-of-modules --no-install --include-dev',
            ['check:coverage']: 'npx vitest run --coverage=true',
            ['check:full']:
                'npm run lint && npm run check:types && npm run check:coverage && npm run build && npm run check:project',
            ['check:project']: 'npx node-standards lint',
            ['check:types']: 'npx tsc -p tsconfig.json',
            ['format']: 'npx prettier "**/*.{ts,js,json,yml,yaml,md}" --write',
            ['lint:full']: 'bash -c "FULL_LINT=true npm run lint"',
            ['lint:fix']: 'npm run lint -- --fix',
            // The `--no-eslintrc` flag is used to prevent ESLint from loading the nested `.eslintrc.cjs` file in `/examples`.
            ['lint']: 'npx eslint "./{src,test,typings}/**/*.ts" --cache --no-eslintrc --config .eslintrc.cjs',
            ['package']: 'rm -rf .dist && npm run build',
            ['test']: 'npx vitest run',
        },
        publishConfig: {
            registry: 'https://registry.npmjs.org',
            access: 'public',
            provenance: true,
        },
        dependencies: {
            tslib: dependencies.tslib,
        },
        devDependencies: {
            ...peerDependencies,
            tslib: undefined,
        },
        roots: [rootDirectory],
        links: ['common'],
    },
}
