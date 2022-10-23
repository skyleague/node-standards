import { ProjectLinter } from './lint'

import type { ProjectTemplate } from '../../lib/templates'
import type { PackageConfiguration, PackageJson } from '../../lib/types'
import { PackageType } from '../../lib/types'

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
            type: PackageType.YargsCli,
            template: {
                exclude: ['foofile'],
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintConfiguration()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "foo-key": {
                "template": {
                  "exclude": [
                    "foofile",
                  ],
                },
                "type": "yargs-cli",
              },
            }
        `)
        expect(linter.shouldFail).toBeFalsy()
    })
})

describe('lint definition', () => {
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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    definition: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'template', 'get').mockReturnValue({ definition: { foo: 'bar' } } as unknown as ProjectTemplate)
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.linDefinition()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

        linter.linDefinition()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            definition: {
                engine: 'nodefoo',
            },
        } as unknown as ProjectTemplate)

        linter.linDefinition()
        expect(packagejson).toMatchInlineSnapshot(`
            {
              "engine": "nodefoo",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    files: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({ files: ['foo', 'bar'] } as unknown as ProjectTemplate)

        linter.lintPackageFiles()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            files: ['src/', 'docs'],
        } as unknown as ProjectTemplate)

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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    publishConfig: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({ publishConfig: { foo: 'bar' } } as unknown as ProjectTemplate)

        linter.lintPublishConfig()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

        linter.lintPublishConfig()
        expect(packagejson).toMatchInlineSnapshot(`{}`)
        expect(linter.shouldFail).toBeFalsy()
    })

    test('fixes the package according to the template', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            publishConfig: {
                registry: 'https://registry.npmjs.org',
                access: 'public',
            },
        } as unknown as ProjectTemplate)

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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    scripts: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({ scripts: { foo: 'bar' } } as unknown as ProjectTemplate)

        linter.lintScripts()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            scripts: {
                fooz: 'npx bar',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            scripts: {
                fooz: 'npx bar2',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                scripts: {
                    fooz: 'npx bar',
                    foo: 'npx baz',
                },
            },
        ] as unknown as ProjectTemplate[])

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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    dependencies: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            dependencies: {
                foo: 'bar',
            },
        } as unknown as ProjectTemplate)

        linter.lintDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            dependencies: {
                fooz: '^1.0.0',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            dependencies: {
                foo: '^1.0.0',
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            dependencies: {
                fooz: '^1.0.0',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            dependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as ProjectTemplate)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                dependencies: {
                    foo: '^2.0.0',
                },
            },
        ] as unknown as ProjectTemplate[])

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
            type: PackageType.YargsCli,
            template: {
                lint: {
                    devDependencies: false,
                },
            },
        }
        const packagejson = { 'foo-key': config } as unknown as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            devDependencies: {
                foo: 'bar',
            },
        } as unknown as ProjectTemplate)

        linter.lintDevDependencies()
        expect(linter.shouldFail).toBeFalsy()
    })

    test('does not fail when template isnt found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)
        jest.spyOn(linter, 'template', 'get').mockReturnValue(undefined)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            devDependencies: {
                foo: '^1.0.0',
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            devDependencies: {
                fooz: '^1.0.0',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            devDependencies: {
                fooz: '^1.0.0',
                foo: undefined,
            },
        } as unknown as ProjectTemplate)

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
        jest.spyOn(linter, 'template', 'get').mockReturnValue({
            devDependencies: {
                fooz: '^1.0.0',
            },
        } as unknown as ProjectTemplate)
        jest.spyOn(linter, 'links', 'get').mockReturnValue([
            {
                devDependencies: {
                    foo: '^2.0.0',
                },
            },
        ] as unknown as ProjectTemplate[])

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
