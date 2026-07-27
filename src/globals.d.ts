/// <reference types="astro/client" />

import type { ImportMetaEnvAugmented } from "@arkenv/vite-plugin"
import type { RowData } from "@tanstack/react-table"

import type { EnvSchema } from "./env-schema"
import type { UserWithPermissions } from "./helpers/supabase/auth"

declare global {
    namespace App {
        interface Locals {
            user: UserWithPermissions | null
        }
    }

    interface ImportMetaEnv extends ImportMetaEnvAugmented<
        typeof EnvSchema,
        "PUBLIC_"
    > {}
}

declare module "@tanstack/react-table" {
    interface ColumnMeta<TData extends RowData, TValue> {
        className?: string
    }
}
