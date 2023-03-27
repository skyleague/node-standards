import { $object, $string, $array, $union, $optional, $boolean } from '@skyleague/therefore'

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
        })
    ),
})

export const legacyPackageConfiguration = $object({
    type: $string,
    template: $optional(
        $object({
            exclude: $optional($array($string)),
            lint: $optional(
                $object({
                    publishConfig: $optional($boolean),
                    license: $optional($boolean),
                    engines: $optional($boolean),
                    files: $optional($boolean),
                    dependencies: $optional($boolean),
                    devDependencies: $optional($boolean),
                    scripts: $optional($boolean),
                    definition: $optional($boolean),
                })
            ),
            documentation: $optional($string),
        })
    ),
})

export const anyPackageConfiguration = $union([packageConfiguration, legacyPackageConfiguration])
