import { ProjectLinter } from './linter.js'
import type { ProjectDefinition } from './templates/types.js'
import type { PackageJson } from './types.js'

import type { PackageConfiguration } from '../config/index.js'

import { expect, describe, beforeEach, afterEach, vi, it } from 'vitest'

describe('lint configuration', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('set default config when none found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintConfiguration()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "foo-key": {
                "type": "library",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('dont modify a valid configuration', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            ignorePatterns: ['foofile'],
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintConfiguration()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "foo-key": {
                "extends": "yargs-cli",
                "ignorePatterns": [
                  "foofile",
                ],
              },
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('upgrade a legacy configuration', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            ignorePatterns: ['foofile'],
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintConfiguration()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "foo-key": {
                "extends": "yargs-cli",
                "ignorePatterns": [
                  "foofile",
                ],
              },
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })
})

describe('lint package files', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                files: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'layers', 'get').mockReturnValue([{ files: ['foo', 'bar'] } as unknown as ProjectDefinition])

        linter.lintPackageFiles()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'layers', 'get').mockReturnValue(undefined)

        linter.lintPackageFiles()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "files": [],
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                files: ['src/', 'docs'],
            } as unknown as ProjectDefinition,
        ])

        linter.lintPackageFiles()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "files": [
                "src/",
                "docs",
              ],
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            files: ['src/', 'docs'],
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'layers', 'get').mockReturnValue([
            {
                files: ['src/'],
            } as unknown as ProjectDefinition,
        ])
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                files: ['src/', 'docs', 'test'],
            },
        ] as unknown as ProjectDefinition[])

        linter.lintPackageFiles()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "files": [
                "src/",
                "docs",
                "test",
              ],
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint publish config', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                publishConfig: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintPublishConfig()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintPublishConfig()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: {
                    registry: 'https://registry.npmjs.org',
                    access: 'public',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintPublishConfig()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "publishConfig": {
                "access": "public",
                "registry": "https://registry.npmjs.org",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            publishConfig: {
                access: 'public',
                registry: 'https://registry.npmjs.org',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: {
                    access: 'restricted',
                    registry: 'https://registry.npmjs.org',
                },
            },
            {
                publishConfig: {
                    access: 'restricted',
                    registry: 'https://npm.pkg.github.com/',
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintPublishConfig()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "publishConfig": {
                "access": "restricted",
                "registry": "https://npm.pkg.github.com/",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint license', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                license: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                license: 'foobar',
            } as unknown as ProjectDefinition,
        ])

        linter.lintLicense()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintLicense()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                license: 'UNLICENSED',
            } as unknown as ProjectDefinition,
        ])

        linter.lintLicense()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "license": "UNLICENSED",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            license: 'UNLICENSED',
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                license: 'PROPRIETARY',
            },
            {
                license: 'MIT',
            },
        ] as unknown as ProjectDefinition[])

        linter.lintLicense()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "license": "MIT",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint engines', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                engines: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintEngines()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintEngines()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                engines: {
                    node: '>=18',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintEngines()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "engines": {
                "node": ">=18",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            engines: {
                node: '>=16',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                engines: {
                    node: '>=14',
                },
            },
            {
                engines: {
                    node: '>=18',
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintEngines()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "engines": {
                "node": ">=18",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint package type', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                packageType: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintPackageType()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintPackageType()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                packageType: 'module',
            } as unknown as ProjectDefinition,
        ])

        linter.lintPackageType()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "type": "module",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            type: 'commonjs',
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                packageType: 'commonjs',
            },
            {
                packageType: 'module',
            },
        ] as unknown as ProjectDefinition[])

        linter.lintPackageType()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "type": "module",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint main', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                main: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintMain()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintMain()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                main: './.dist/index.js',
            } as unknown as ProjectDefinition,
        ])

        linter.lintMain()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "main": "./.dist/index.js",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            main: './.main.js',
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                main: './.main.js',
            },
            {
                main: './.dist/index.js',
            },
        ] as unknown as ProjectDefinition[])

        linter.lintMain()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "main": "./.dist/index.js",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint types', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                types: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintTypes()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintTypes()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                types: './.dist/index.d.ts',
            } as unknown as ProjectDefinition,
        ])

        linter.lintTypes()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "types": "./.dist/index.d.ts",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            types: './index.d.ts',
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                types: './index.d.ts',
            },
            {
                types: './.dist/index.d.ts',
            },
        ] as unknown as ProjectDefinition[])

        linter.lintTypes()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "types": "./.dist/index.d.ts",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint exports', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                exports: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintExports()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintExports()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template - string', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                exports: './.dist/index.js',
            } as unknown as ProjectDefinition,
        ])

        linter.lintExports()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "exports": "./.dist/index.js",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to the template - map', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                exports: {
                    '.': './.dist/index.js',
                    './package.json': './package.json',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintExports()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "exports": {
                ".": "./.dist/index.js",
                "./package.json": "./package.json",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            exports: './index.js',
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                exports: './index.js',
            },
            {
                exports: {
                    '.': './.dist/index.js',
                    './package.json': './package.json',
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintExports()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "exports": {
                ".": "./.dist/index.js",
                "./package.json": "./package.json",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint script', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                scripts: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([{ scripts: { foo: 'bar' } } as unknown as ProjectDefinition])

        linter.lintScripts()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintScripts()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "scripts": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {
            scripts: {
                foo: 'npx bar',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                scripts: {
                    fooz: 'npx bar',
                    foo: undefined,
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintScripts()
        expect(packagejson).toMatchInlineSnapshot(`
          {
            "scripts": {
              "fooz": "npx bar",
            },
          }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            scripts: {
                foo: 'npx bar',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                scripts: {
                    fooz: 'npx bar',
                    foo: 'npx baz',
                },
            },
            {
                scripts: {
                    fooz: 'npx bar2',
                    foo: undefined,
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintScripts()
        expect(packagejson).toMatchInlineSnapshot(`
          {
            "scripts": {
              "fooz": "npx bar2",
            },
          }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint dependencies', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                dependencies: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    foo: 'bar',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    fooz: '^1.0.0',
                    foo: undefined,
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {
                "fooz": "^1.0.0",
              },
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('allows inclusive semver ranges', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.1.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    foo: '^1.0.0',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {
                "foo": "^1.1.0",
              },
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('remove dependencies from devDependencies', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
            devDependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    fooz: '^1.0.0',
                    foo: undefined,
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {
                "fooz": "^1.0.0",
              },
              "devDependencies": {
                "fooz": "^1.0.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    fooz: '^1.0.0',
                },
            },
            {
                dependencies: {
                    foo: '^2.0.0',
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {
                "foo": "^2.0.0",
                "fooz": "^1.0.0",
              },
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint devDependencies', () => {
    let linter: ProjectLinter

    afterEach(() => {
        vi.restoreAllMocks()
    })
    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    it('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                devDependencies: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    foo: 'bar',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDevDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    it('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('allows inclusive semver ranges', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.1.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    foo: '^1.0.0',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {
                "foo": "^1.1.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to the template', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    fooz: '^1.0.0',
                    foo: undefined,
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {
                "fooz": "^1.0.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    it('remove devDependencies from dependencies', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
            devDependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'layers', 'get').mockReturnValue([
            {
                devDependencies: {
                    fooz: '^1.0.0',
                    foo: undefined,
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {
                "foo": "^1.0.0",
              },
              "devDependencies": {
                "fooz": "^1.0.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    it('fixes the package according to all linked templates', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        vi.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        vi.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    fooz: '^1.0.0',
                },
            },
            {
                devDependencies: {
                    foo: '^2.0.0',
                },
            },
        ] as unknown as ProjectDefinition[])

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {
                "foo": "^2.0.0",
                "fooz": "^1.0.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})
