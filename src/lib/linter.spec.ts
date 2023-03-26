import { ProjectLinter } from './linter'
import type { ProjectDefinition } from './templates/types'
import type { PackageJson } from './types'

import type { PackageConfiguration } from '../config'

describe('lint configuration', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => jest.restoreAllMocks())

    test('set default config when none found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

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

    test('dont modify a valid configuration', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            ignorePatterns: ['foofile'],
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

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

    test('upgrade a legacy configuration', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            ignorePatterns: ['foofile'],
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

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

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                files: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'layers', 'get').mockReturnValue([{ files: ['foo', 'bar'] } as unknown as ProjectDefinition])

        linter.lintPackageFiles()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'layers', 'get').mockReturnValue(undefined)

        linter.lintPackageFiles()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "files": [],
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            files: ['src/', 'docs'],
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'layers', 'get').mockReturnValue([
            {
                files: ['src/'],
            } as unknown as ProjectDefinition,
        ])
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                publishConfig: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintPublishConfig()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintPublishConfig()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            publishConfig: {
                access: 'public',
                registry: 'https://registry.npmjs.org',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                license: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                license: 'foobar',
            } as unknown as ProjectDefinition,
        ])

        linter.lintLicense()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintLicense()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            license: 'UNLICENSED',
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                engines: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                publishConfig: { foo: 'bar' },
            } as unknown as ProjectDefinition,
        ])

        linter.lintEngines()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintEngines()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            engines: {
                node: '>=16',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

describe('lint script', () => {
    let linter: ProjectLinter

    beforeEach(() => {
        linter = new ProjectLinter({
            templates: [],
            configurationKey: 'foo-key',
            fix: false,
        })
    })

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                scripts: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([{ scripts: { foo: 'bar' } } as unknown as ProjectDefinition])

        linter.lintScripts()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintScripts()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "scripts": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {
            scripts: {
                foo: 'npx bar',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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
                "foo": undefined,
                "fooz": "npx bar",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            scripts: {
                foo: 'npx bar',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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
                "foo": undefined,
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
    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                dependencies: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    foo: 'bar',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('allows inclusive semver ranges', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.1.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('remove dependencies from devDependencies', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
            devDependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    afterEach(() => jest.restoreAllMocks())
    beforeEach(
        () =>
            (linter = new ProjectLinter({
                templates: [],
                configurationKey: 'foo-key',
                fix: false,
            }))
    )

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            extends: 'yargs-cli',
            rules: {
                devDependencies: false,
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    foo: 'bar',
                },
            } as unknown as ProjectDefinition,
        ])

        linter.lintDevDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintDevDependencies()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "dependencies": {},
              "devDependencies": {},
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('allows inclusive semver ranges', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.1.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('fixes the package according to the template', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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

    test('remove devDependencies from dependencies', () => {
        const packagejson = {
            dependencies: {
                foo: '^1.0.0',
            },
            devDependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'layers', 'get').mockReturnValue([
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

    test('fixes the package according to all linked templates', () => {
        const packagejson = {
            devDependencies: {
                foo: '^1.0.0',
            },
        } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
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
