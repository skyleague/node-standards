import { foo } from './sub/index.js'

export function main(): string {
    foo()
    return 'yay'
}
