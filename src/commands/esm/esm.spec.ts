import { updateEsmImports } from './esm.js'

import { expect, describe, beforeEach, vi, it } from 'vitest'

describe('update ESM imports', () => {
    const _fs = {
        existsSync: vi.fn(),
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

    it('single line import', () => {
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

    it('multiline import', () => {
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

    it('mixed', () => {
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
