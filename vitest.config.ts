import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        setupFiles: ['./test/__test__/setup.ts'],
        exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'examples'],
        coverage: {
            reportsDirectory: './.coverage',
        },
        fakeTimers: {
            now: new Date(2022, 1, 10),
            toFake: [
                // 'setTimeout',
                // 'setImmediate',
                'clearTimeout',
                'setInterval',
                'clearInterval',
                'clearImmediate',
                'Date',
            ],
        },
    },
})
