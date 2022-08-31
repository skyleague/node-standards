import { run } from '../src'

test('main', () => {
    expect(run).toBeTruthy()
})

test('maintwo', () => {
    expect({ foo: 'bar' }).toMatchInlineSnapshot(`
        {
          "foo": "bar",
        }
    `)
})

test('timer', () => {
    expect(new Date()).toEqual(new Date(2022, 1, 10))
})
