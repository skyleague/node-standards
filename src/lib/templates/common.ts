import type { ProjectTemplate, ProjectTemplateBuilder } from './types.js'

import { dependencies, peerDependencies, repositoryUrl, rootDirectory } from '../constants.js'

export const CommonTemplate: ProjectTemplate = {
    type: 'common',
    template: {
        repositoryUrl,
        scripts: {
            ['prepare']: 'husky || true',
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
            ['check:coverage']: 'vitest run --coverage=true',
            ['check:full']: undefined,
            ['check:project']: 'node-standards lint',
            ['check:types']: 'tsc -p tsconfig.json',
            ['format']: 'prettier "**/*.{ts,js,json,yml,yaml,md}" --write',
            ['lint:full']: undefined,
            ['lint:fix']: 'npm run lint -- --fix',
            // The `--no-eslintrc` flag is used to prevent ESLint from loading the nested `.eslintrc.cjs` file in `/examples`.
            ['lint']: 'eslint "./{src,test,typings}/**/*.ts" --cache --no-eslintrc --config .eslintrc.cjs',
            ['package']: 'rm -rf .dist && npm run build',
            ['test']: 'vitest run',
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
