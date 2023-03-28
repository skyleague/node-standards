import { updateEsmImports } from './esm.js'

describe('update ESM imports', () => {
    const _fs = {
        existsSync: jest.fn(),
    }
    beforeEach(() => {
        _fs.existsSync.mockReset()
    })

    const multiLineImport = `
import type {
    Foo,
    Bar 
} from './types'`
    const singleLineImport = `
import type { Foo, Bar } from './types'`

    test('single line import', () => {
        _fs.existsSync.mockReturnValueOnce(true)

        expect(
            updateEsmImports(
                {
                    originalContents: singleLineImport.trimStart(),
                    assertJson: true,
                    skipTherefore: true,
                    filePath: '/app/index.ts',
                },
                _fs
            )
        ).toMatchInlineSnapshot(`"import type { Foo, Bar } from './types.js'"`)

        _fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true)

        expect(
            updateEsmImports(
                {
                    originalContents: singleLineImport.trimStart(),
                    assertJson: true,
                    skipTherefore: true,
                    filePath: '/app/index.ts',
                },
                _fs
            )
        ).toMatchInlineSnapshot(`"import type { Foo, Bar } from './types/index.js'"`)
    })

    test('multiline import', () => {
        _fs.existsSync.mockReturnValueOnce(true)

        expect(
            updateEsmImports(
                {
                    originalContents: multiLineImport.trimStart(),
                    assertJson: true,
                    skipTherefore: true,
                    filePath: '/app/index.ts',
                },
                _fs
            )
        ).toMatchInlineSnapshot(`
            "import type {
                Foo,
                Bar 
            } from './types.js'"
        `)

        _fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(true)

        expect(
            updateEsmImports(
                {
                    originalContents: multiLineImport.trimStart(),
                    assertJson: true,
                    skipTherefore: true,
                    filePath: '/app/index.ts',
                },
                _fs
            )
        ).toMatchInlineSnapshot(`
            "import type {
                Foo,
                Bar 
            } from './types/index.js'"
        `)
    })

    test('mixed', () => {
        _fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(true)

        expect(
            updateEsmImports(
                {
                    originalContents: [multiLineImport, singleLineImport].join('\n').trimStart(),
                    assertJson: true,
                    skipTherefore: true,
                    filePath: '/app/index.ts',
                },
                _fs
            )
        ).toMatchInlineSnapshot(`
            "import type {
                Foo,
                Bar 
            } from './types.js'

            import type { Foo, Bar } from './types/index.js'"
        `)
    })
})
