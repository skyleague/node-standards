/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */
import type { ValidateFunction } from 'ajv'
import { ValidationError } from 'ajv'

export interface PackageConfiguration {
    extends: [string, ...string[]] | string
    ignorePatterns?: string[]
    rules?: {
        publishConfig?: boolean
        license?: boolean
        engines?: boolean
        files?: boolean
        dependencies?: boolean
        devDependencies?: boolean
        scripts?: boolean
        packageType?: boolean
        exports?: boolean
        types?: boolean
        main?: boolean
    }
    projectSettings?: {
        [k: string]: string | undefined
    }
}

export const PackageConfiguration = {
    validate: (await import('./schemas/package-configuration.schema.js')).validate as ValidateFunction<PackageConfiguration>,
    get schema() {
        return PackageConfiguration.validate.schema
    },
    get errors() {
        return PackageConfiguration.validate.errors ?? undefined
    },
    is: (o: unknown): o is PackageConfiguration => PackageConfiguration.validate(o) === true,
    assert: (o: unknown) => {
        if (!PackageConfiguration.validate(o)) {
            throw new ValidationError(PackageConfiguration.errors ?? [])
        }
    },
} as const
