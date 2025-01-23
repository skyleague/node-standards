import type { ProjectTemplate, ProjectTemplateBuilder } from './types.js'

import { peerDependencies, repositoryUrl, rootDirectory } from '../constants.js'

export const CommonTemplate: ProjectTemplate = {
    type: 'common',
    template: {
        repositoryUrl,
        scripts: {
            prepare: 'husky || true',
        },
        roots: [rootDirectory],
    },
}

export const CommonTypescriptTemplate: ProjectTemplateBuilder = {
    type: 'common-typescript',
    template: {
        repositoryUrl,
        engines: {
            node: '>=22',
        },
        scripts: {
            build: 'tsc -p tsconfig.dist.json',
            'build:clean': undefined,
            'prebuild:docs': 'npm ci',
            'build:docs': undefined,
            'check:cost': undefined,
            'check:coverage': 'vitest run --coverage=true',
            'check:full': undefined,
            'check:project': 'node-standards lint',
            'check:types': 'tsc -p tsconfig.json',
            format: undefined,
            lint: 'biome check',
            'lint:full': undefined,
            'lint:fix': 'node --run lint -- --write --unsafe',
            package: 'rm -rf .dist && node --run build',
            test: 'vitest run',
        },
        publishConfig: {
            access: 'public',
            provenance: true,
            registry: 'https://registry.npmjs.org',
        },
        dependencies: {
            tslib: undefined,
        },
        devDependencies: {
            ...peerDependencies,
            tslib: undefined,
        },
        roots: [rootDirectory],
        links: ['common'],
    },
}
