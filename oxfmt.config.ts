import { defineConfig } from "oxfmt"

export default defineConfig({
    printWidth: 80,
    tabWidth: 4,
    useTabs: false,
    endOfLine: "lf",
    semi: false,
    singleQuote: false,
    jsxSingleQuote: false,
    quoteProps: "as-needed",
    trailingComma: "none",
    arrowParens: "always",
    bracketSpacing: true,
    bracketSameLine: false,
    singleAttributePerLine: false,
    insertFinalNewline: true,
    sortImports: true,
    sortTailwindcss: { functions: ["cn", "twMerge", "cva"] },
    sortPackageJson: true,
    ignorePatterns: ["**/migrations/**", "**/routeTree.gen.ts"]
})
