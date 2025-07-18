import { peerDependencies, repositoryUrl, rootDirectory } from '../constants.js'
import type { ProjectTemplate, ProjectTemplateBuilder } from './types.js'

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
            'check:coverage': 'vitest run --coverage=true',
            'check:project': 'node-standards lint',
            'check:types': 'tsc -p tsconfig.json',
            lint: 'biome check',
            'lint:fix': 'node --run lint -- --write --unsafe',
            package: 'rm -rf .dist && node --run build',
            test: 'vitest run',
        },
        publishConfig: {
            access: 'public',
            provenance: true,
            registry: 'https://registry.npmjs.org',
        },
        dependencies: {},
        devDependencies: {
            ...peerDependencies,
        },
        roots: [rootDirectory],
        links: ['common'],
    },
}
