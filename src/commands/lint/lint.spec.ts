import { ProjectLinter } from './lint'

import type { ProjectTemplate } from '../../lib/templates'
import type { PackageConfiguration, PackageJson } from '../../lib/types'
import { PackageType } from '../../lib/types'

describe('lint configuration', () => {
    const linter = new ProjectLinter({
        templates: [],
        configurationKey: 'foo-key',
        fix: false,
    })

    afterEach(() => jest.restoreAllMocks())

    test('set default config when none found', () => {
        const packagejson = {} as PackageJson
        jest.spyOn(linter, 'packagejson', 'get').mockReturnValue(packagejson)

        linter.lintConfiguration()
        expect(packagejson).toMatchInlineSnapshot(`
            Object {
              "foo-key": Object {
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
            Object {
              "foo-key": Object {
                "template": Object {
                  "exclude": Array [
                    "foofile",
                  ],
                },
                "type": "yargs-cli",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint definition', () => {
    const linter = new ProjectLinter({
        templates: [],
        configurationKey: 'foo-key',
        fix: false,
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
        expect(packagejson).toMatchInlineSnapshot(`Object {}`)
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
            Object {
              "engine": "nodefoo",
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})
describe('lint package files', () => {
    const linter = new ProjectLinter({
        templates: [],
        configurationKey: 'foo-key',
        fix: false,
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
            Object {
              "files": Array [],
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
            Object {
              "files": Array [
                "src/",
                "docs",
              ],
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint script', () => {
    const linter = new ProjectLinter({
        templates: [],
        configurationKey: 'foo-key',
        fix: false,
    })

    afterEach(() => jest.restoreAllMocks())

    test('explicit ignore skips lint step', () => {
        const config: PackageConfiguration = {
            type: PackageType.YargsCli,
            template: {
                lint: {
                    script: false,
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
            Object {
              "scripts": Object {},
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
            Object {
              "scripts": Object {
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
            Object {
              "scripts": Object {
                "foo": undefined,
                "fooz": "npx bar2",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})

describe('lint dependencies', () => {
    const linter = new ProjectLinter({
        templates: [],
        configurationKey: 'foo-key',
        fix: false,
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
            Object {
              "dependencies": Object {},
              "devDependencies": Object {},
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
            Object {
              "dependencies": Object {
                "fooz": "^1.0.0",
              },
              "devDependencies": Object {},
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
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
            Object {
              "dependencies": Object {
                "fooz": "^1.0.0",
              },
              "devDependencies": Object {
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
            Object {
              "dependencies": Object {
                "foo": "^2.0.0",
                "fooz": "^1.0.0",
              },
              "devDependencies": Object {},
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
            Object {
              "dependencies": Object {},
              "devDependencies": Object {},
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
            Object {
              "dependencies": Object {},
              "devDependencies": Object {
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
            Object {
              "dependencies": Object {
                "foo": "^1.0.0",
              },
              "devDependencies": Object {
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
            Object {
              "dependencies": Object {},
              "devDependencies": Object {
                "foo": "^2.0.0",
                "fooz": "^1.0.0",
              },
            }
        `)
        expect(linter.shouldFail).toBeTruthy()
    })
})
