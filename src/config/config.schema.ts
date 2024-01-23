import { $object, $string, $array, $union, $optional, $boolean, $dict } from '@skyleague/therefore'

export const packageConfiguration = $object({
    extends: $union([$array($string, { minItems: 1 }), $string]),
    ignorePatterns: $optional($array($string)),
    rules: $optional(
        $object({
            publishConfig: $optional($boolean),
            license: $optional($boolean),
            engines: $optional($boolean),
            files: $optional($boolean),
            dependencies: $optional($boolean),
            devDependencies: $optional($boolean),
            scripts: $optional($boolean),
            packageType: $optional($boolean),
            exports: $optional($boolean),
            types: $optional($boolean),
            main: $optional($boolean),
        })
    ),
    template: $optional($dict($string)),
})
