import noConsoleInActions from "./rules/no-console-in-actions.ts"
import noDashboardPrerender from "./rules/no-dashboard-prerender.ts"
import noNonPublicEnvInClient from "./rules/no-non-public-env-in-client.ts"
import noOptionalResult from "./rules/no-optional-result.ts"
import noTryCatch from "./rules/no-try-catch.ts"
import noUnwrappedThrowingBuiltin from "./rules/no-unwrapped-throwing-builtin.ts"
import preferSafeParse from "./rules/prefer-safe-parse.ts"
import requireActionNameMatches from "./rules/require-action-name-matches.ts"
import requireServerActionWrapper from "./rules/require-server-action-wrapper.ts"
import type { Plugin } from "./types.ts"

const plugin: Plugin = {
    meta: { name: "local" },
    rules: {
        "no-try-catch": noTryCatch,
        "no-non-public-env-in-client": noNonPublicEnvInClient,
        "no-dashboard-prerender": noDashboardPrerender,
        "no-optional-result": noOptionalResult,
        "require-server-action-wrapper": requireServerActionWrapper,
        "no-console-in-actions": noConsoleInActions,
        "require-action-name-matches": requireActionNameMatches,
        "prefer-safe-parse": preferSafeParse,
        "no-unwrapped-throwing-builtin": noUnwrappedThrowingBuiltin
    }
}

export default plugin
