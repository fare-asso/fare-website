import { defineConfig } from "taze"

export default defineConfig({
    // ignore packages from bumping
    exclude: [],
    // fetch latest package info from registry without cache
    force: false,
    // write to package.json
    write: true,
    // run `pnpm install` right after bumping
    install: false,
    // ignore paths for looking for package.json in monorepo
    ignorePaths: ["**/node_modules/**", "**/test/**"],
    // ignore package.json that in other workspaces (with their own .git,pnpm-workspace.yaml,etc.)
    ignoreOtherWorkspaces: false,
    // disable checking for "overrides" package.json field
    depFields: {
        overrides: false
    },
    maturityPeriod: 1
})
