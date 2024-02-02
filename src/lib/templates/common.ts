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
            node: '>=20',
        },
        scripts: {
            ['build']: 'node --import tsx/esm build.config.ts',
            ['build:clean']: undefined,
            ['build:docs']: 'npx typedoc',
            ['check:cost']: undefined,
            ['check:coverage']: 'npx vitest run --coverage=true',
            ['check:full']: undefined,
            ['check:project']: 'npx node-standards lint',
            ['check:types']: 'npx tsc -p tsconfig.json',
            ['format']: 'npx prettier "**/*.{ts,js,json,yml,yaml,md}" --write',
            ['lint:full']: undefined,
            ['lint:fix']: 'npm run lint -- --fix',
            // The `--no-eslintrc` flag is used to prevent ESLint from loading the nested `.eslintrc.cjs` file in `/examples`.
            ['lint']: 'npx eslint "./{src,test,typings}/**/*.ts" --cache --no-eslintrc --config .eslintrc.cjs',
            ['package']: 'rm -rf .dist && npm run build',
            ['test']: 'npx vitest run',
        },
        publishConfig: {
            access: 'public',
            provenance: true,
            registry: 'https://registry.npmjs.org',
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
