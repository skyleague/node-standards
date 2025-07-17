import { vi } from 'vitest'

const consoleMock = {
    ...console,
    error: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
}

vi.stubGlobal('console', consoleMock)
vi.useFakeTimers()
