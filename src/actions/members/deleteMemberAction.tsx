import { createServerFn } from "@tanstack/react-start"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function deleteMemberActionImpl({ id }: { id: number }) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:member")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des membres"
        }
    }

    // create supabase client
    const supabase = createClient()

    const deleted = await tryCatch(
        prisma.member.delete({
            where: { id: id }
        })
    )
    if (!deleted.success) {
        captureActionError(deleted.error)
        return { error: "Echec de la suppression du membre" }
    }
    const res = deleted.value

    if (res == null) return { error: "Failed to delete record" }

    // successfully deleted
    const { error } = await supabase.storage
        .from("member-pictures")
        .remove([res.picturePath])

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

const deleteMemberActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof deleteMemberActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "deleteMemberAction",
            deleteMemberActionImpl
        )(...unpackActionArgs<Parameters<typeof deleteMemberActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof deleteMemberActionImpl>
): ReturnType<typeof deleteMemberActionImpl> =>
    deleteMemberActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof deleteMemberActionImpl>
