import { defineConfig } from "oxlint"

export default defineConfig({
    options: {
        typeAware: true,
        typeCheck: true,
        reportUnusedDisableDirectives: "error"
    },
    plugins: [
        "eslint",
        "typescript",
        "unicorn",
        "oxc",
        "node",
        "import",
        "react",
        "react-perf",
        "jsx-a11y",
        "vitest",
        "jest",
        "promise"
    ],
    jsPlugins: [{ name: "local", specifier: "./tools/oxlint-rules/index.ts" }],
    categories: {
        correctness: "error"
    },
    ignorePatterns: [
        "**/migrations/**",
        "**/generated/**",
        ".astro/**"
    ],
    overrides: [
        {
            // Test files & mocks: async mock factories must keep the async
            // signature, and conditional expect is fine in helpers. biome
            // tolerated these (no findings on its side).
            files: [
                "**/*.test.ts",
                "**/*.test.tsx",
                "**/__tests__/**",
                "src/test/**"
            ],
            rules: {
                "typescript/no-unsafe-type-assertion": "off",
                "require-await": "off",
                "vitest/no-conditional-expect": "off",
                "jest/no-conditional-expect": "off",
                "typescript/require-array-sort-compare": "off"
            }
        },
        {
            files: ["src/env.ts", "astro.config.ts"],
            rules: { "node/no-process-env": "off" }
        },
        {
            // oxlint's type-aware pass resolves the prisma-generated types as
            // `any` inside ambient .d.ts files; tsgo checks this correctly.
            files: ["src/globals.d.ts"],
            rules: {
                "typescript/no-redundant-type-constituents": "off",
                // App.Locals augmentation requires the ambient namespace form
                "typescript/no-namespace": "off"
            }
        },
        {
            // biome useFilenamingConvention used strictCase:false to allow
            // embedded acronyms (CDP, HTML). oxlint's unicorn/filename-case
            // has no strictCase / working `ignore`, so scope it off for the
            // acronym-bearing files the project intentionally uses.
            files: ["**/CDP/**", "**/contentHTML.tsx"],
            rules: { "unicorn/filename-case": "off" }
        },
        {
            // locationPicker is a hand-rolled ARIA 1.2 combobox: the
            // combobox/listbox/option roles are required by the pattern and
            // have no plain-tag equivalent, so prefer-tag-over-role is a
            // false positive here.
            files: ["**/location/locationPicker.tsx"],
            rules: { "jsx-a11y/prefer-tag-over-role": "off" }
        }
    ],
    rules: {
        // a11y
        "jsx-a11y/no-noninteractive-element-interactions": "error",
        "jsx-a11y/no-static-element-interactions": "warn",

        // correctness
        // biome's noUnusedVariables ignores leading-underscore names; mirror
        // that so `catch (_error)` / unused `_args` are not flagged.
        "no-unused-vars": [
            "error",
            {
                caughtErrorsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }
        ],
        "react/jsx-key": "error",
        "react/no-children-prop": "off",

        // correctness-category rules with no biome counterpart — silenced so
        // the result mirrors biome's clean output instead of adding noise.
        "vitest/require-mock-type-parameters": "off",
        "typescript/no-base-to-string": "off",

        "jsx-a11y/control-has-associated-label": "off",
        "jsx-a11y/prefer-tag-over-role": "warn",
        "jsx-a11y/interactive-supports-focus": "warn",
        "jsx-a11y/role-has-required-aria-props": "warn",
        "jsx-a11y/no-autofocus": "warn",
        "react-hooks/exhaustive-deps": "warn",

        // complexity
        "unicorn/no-array-for-each": "error",
        "no-useless-concat": "error",

        // nursery
        "typescript/no-floating-promises": "off",

        // performance
        "oxc/no-barrel-file": ["error", { threshold: 10 }],
        "no-await-in-loop": "warn",

        // style
        "typescript/no-require-imports": "error",
        "typescript/no-inferrable-types": "error",
        "typescript/no-namespace": "error",
        "no-negated-condition": "error",
        "node/no-process-env": "error",
        "typescript/prefer-as-const": "error",
        "unicorn/prefer-at": "error",
        "no-lonely-if": "error",
        "typescript/array-type": "error",
        "react/jsx-curly-brace-presence": "error",
        "prefer-const": "error",
        "default-param-last": "error",
        "unicorn/explicit-length-check": "error",
        "typescript/consistent-type-exports": "error",
        "typescript/consistent-type-imports": "error",
        "unicorn/filename-case": [
            "error",
            {
                cases: {
                    camelCase: true,
                    pascalCase: true,
                    kebabCase: true
                }
            }
        ],
        "react/jsx-fragments": "error",
        "unicorn/prefer-node-protocol": "error",
        "unicorn/prefer-number-properties": "error",
        "operator-assignment": "error",
        "typescript/prefer-function-type": "error",
        "unicorn/throw-new-error": "error",
        "typescript/only-throw-error": "error",

        "local/no-try-catch": "error",
        "local/no-non-public-env-in-client": "error",
        "local/no-dashboard-prerender": "error",
        "local/require-server-action-wrapper": "error",

        // Flags non-discriminated action results (optional `success?`/`error?`).
        // Kept "off" until the actions are migrated to discriminated unions
        // (TODO.md #3); the follow-up PR flips this to "error" to enforce it.
        "local/no-optional-result": "off",

        // Further CLAUDE.md conventions kept "off" until opted in.
        "local/no-console-in-actions": "off",
        "local/require-action-name-matches": "error",
        "local/prefer-safe-parse": "error",
        "local/no-unwrapped-throwing-builtin": "off",

        // suspicious
        "vitest/no-duplicate-hooks": "error",
        "no-empty": "error",
        "jest/no-export": "error",
        "no-var": "error",
        "require-await": "error",
        "guard-for-in": "error",
        "array-callback-return": "error",
        "typescript/ban-ts-comment": "error",
        "unicorn/no-document-cookie": "error"
    }
})
