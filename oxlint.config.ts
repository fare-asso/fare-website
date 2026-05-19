import { defineConfig } from "oxlint"

export default defineConfig({
    options: {
        typeAware: true,
        typeCheck: true
    },
    plugins: [
        "eslint",
        "typescript",
        "unicorn",
        "oxc",
        "node",
        "import",
        "nextjs",
        "react",
        "react-perf",
        "jsx-a11y",
        "vitest",
        "jest",
        "promise"
    ],
    // Minimal: only the `correctness` safety net (oxlint's analog of biome
    // `recommended: true`). Style/suspicious are NOT enabled wholesale —
    // biome.jsonc only opts into specific rules, so we mirror that via the
    // explicit `rules` map below instead of broad categories (which added
    // ~13k findings absent from biome).
    categories: {
        correctness: "error"
    },
    ignorePatterns: [
        "**/next-env.d.ts",
        "**/migrations/**",
        "**/dist",
        "**/out"
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
            // src/env.ts is the sanctioned env-access file (t3-env pattern);
            // biome suppressed noProcessEnv here via biome-ignore-all.
            files: ["src/env.ts"],
            rules: { "node/no-process-env": "off" }
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
        // biome `noUndeclaredVariables` is TS-aware; the raw eslint `no-undef`
        // is not (the TS compiler already covers undeclared vars), so it is
        // disabled to avoid ~220 non-biome false positives.
        "no-undef": "off",
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
        // biome has no equivalent for these; they false-positive on
        // idiomatic code (preallocated arrays, Sentry re-exports, coerced
        // template values), so keep parity with biome and leave them off.
        "unicorn/no-new-array": "off",
        "import/namespace": "off",
        "typescript/restrict-template-expressions": "off",
        // jsx-a11y plugin rules not in biome.jsonc, and react-hooks
        // exhaustive-deps: biome's a11y recommended set / useExhaustive-
        // Dependencies treat these as non-erroring on this codebase.
        // Downgraded to warn to match biome's effective severity while
        // keeping the signal visible (warnings don't fail the run).
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
        "import/no-cycle": "off",

        // performance
        "oxc/no-barrel-file": "error",
        "nextjs/no-img-element": "warn",
        "nextjs/no-unwanted-polyfillio": "warn",
        "nextjs/google-font-preconnect": "warn",
        "no-await-in-loop": "warn",

        // style
        "typescript/no-require-imports": "error",
        "typescript/no-inferrable-types": "error",
        "typescript/no-namespace": "error",
        "no-negated-condition": "error",
        "node/no-process-env": "error",
        yoda: "off",
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
        "nextjs/no-head-element": "warn",
        "unicorn/prefer-node-protocol": "error",
        "unicorn/prefer-number-properties": "error",
        "operator-assignment": "error",
        "typescript/prefer-function-type": "error",
        "unicorn/throw-new-error": "error",
        "typescript/only-throw-error": "error",

        // suspicious
        "no-console": "off",
        "vitest/no-duplicate-hooks": "error",
        "no-empty": "error",
        "jest/no-export": "error",
        "no-var": "error",
        "require-await": "error",
        "guard-for-in": "error",
        "nextjs/no-document-import-in-page": "error",
        "nextjs/no-head-import-in-document": "error",
        "nextjs/google-font-display": "warn",
        "array-callback-return": "error",
        "typescript/ban-ts-comment": "error",
        "unicorn/no-document-cookie": "off"
    }
    // Dropped — no oxlint equivalent (biome rules without a counterpart):
    //   correctness/noUndeclaredDependencies
    //   correctness/noProcessGlobal
    //   correctness/noGlobalDirnameFilename
    //   complexity/noExcessiveCognitiveComplexity (oxlint `complexity` is
    //     cyclomatic, not cognitive — not equivalent)
    //   style/noEnum
    //   style/useNamingConvention
    //   style/useSingleVarDeclarator
    //   suspicious/noImplicitAnyLet
    // Partial: style/useCollapsedIf (collapse nested `if` into `&&`) has no
    //   exact rule; `no-lonely-if` only covers the `else if` case.
})
