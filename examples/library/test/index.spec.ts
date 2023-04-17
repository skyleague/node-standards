import { main } from '../src/index.js'

import { expect, it } from 'vitest'

it('main', () => {
    expect(main()).toEqual('yay')
})
