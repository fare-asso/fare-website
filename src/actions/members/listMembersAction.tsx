import type { ActionAPIContext } from "astro:actions"

import type { Member } from "@/generated/prisma/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getUserWithPermissions } from "@/helpers/supabase/astro"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import { wrapAction } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

export type MemberWithPicture = {
    member: Member
    pictureUrl: string
}

export async function fetchMembersWithPictures(): Promise<
    MemberWithPicture[] | null
> {
    const storage = new StorageUtils()
    const members = await tryCatch(
        prisma.member.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] })
    )
    if (!members.success) {
        captureActionError(members.error)
        return null
    }
    return members.value.map((member) => ({
        member: { ...member, order: member.order ?? 0 },
        pictureUrl: storage
            .from("member-pictures")
            .getPublicUrl(member.picturePath)
    }))
}

async function listMembersActionImpl(
    _input: undefined,
    context: ActionAPIContext
): Promise<
    | { success: true; value: MemberWithPicture[] }
    | { success: false; error: string }
> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "access:members")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    const members = await fetchMembersWithPictures()
    if (!members) {
        return { success: false, error: "Échec du chargement des membres." }
    }
    return { success: true, value: members }
}

export const listMembersAction = wrapAction(
    "listMembersAction",
    listMembersActionImpl
)
