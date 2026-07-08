import type { ActionAPIContext } from "astro:actions"

import type {
    LinkCategory,
    LinkItem,
    PresseType
} from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

type CategoryWithLinks = LinkCategory & { liens: LinkItem[] }

type LinkFile = { url: string; name: string; type: PresseType }

export type LinksData = {
    categories: CategoryWithLinks[]
    files: Partial<Record<PresseType, LinkFile[]>>
}

export async function fetchLinks(): Promise<LinksData | null> {
    const storage = new StorageUtils()

    const [categoriesResult, filesResult] = await Promise.all([
        tryCatch(
            prisma.linkCategory.findMany({
                include: { liens: { orderBy: { order: "asc" } } },
                orderBy: { order: "asc" }
            })
        ),
        tryCatch(
            prisma.communiqueDePresse.findMany({
                orderBy: { createdAt: "desc" }
            })
        )
    ])

    if (!categoriesResult.success) {
        captureActionError(categoriesResult.error)
        return null
    }
    if (!filesResult.success) {
        captureActionError(filesResult.error)
    }

    const allFiles = (filesResult.success ? filesResult.value : []).map(
        (file) => ({
            url: storage
                .from("communique-de-presse")
                .getPublicUrl(file.filePath, false),
            name: file.name,
            type: file.type
        })
    )

    return {
        categories: categoriesResult.value,
        files: { ...Object.groupBy(allFiles, ({ type }) => type) }
    }
}

async function listLinksActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    { success: true; value: LinksData } | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }

    const links = await fetchLinks()
    if (!links) {
        return { success: false, error: "Échec du chargement des liens." }
    }
    return { success: true, value: links }
}

export const listLinksAction = wrapAction(
    "listLinksAction",
    listLinksActionImpl
)
