import { run } from '../src/index.js'

import { expect, it } from 'vitest'

it('main', () => {
    expect(run).toBeTruthy()
})

it('maintwo', () => {
    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
        {
          "foo": "bar",
        }
    `)
})

it('timer', () => {
    expect(new Date()).toEqual(new Date(2022, 1, 10))
})
