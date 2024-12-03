import { expect, it } from 'vitest'
import { run } from '../src/cli.js'

it('main', () => {
    expect(run).toBeDefined()
})
