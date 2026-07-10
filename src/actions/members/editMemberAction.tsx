import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { uniqueFileName } from "@/helpers/storage"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditMemberSchema, type TEditMember } from "@/schemas/members"

async function editMemberActionImpl(
    input: TEditMember,
    context: ActionAPIContext
): Promise<ActionResult> {
    const user = await getUserWithPermissions(context)
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:member")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des membres"
        }
    }

    const data = EditMemberSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = createClient(context)

    const current = await tryCatch(
        prisma.member.findUnique({
            where: { id: data.id },
            select: { picturePath: true }
        })
    )
    if (!current.success) {
        captureActionError(current.error)
        return { success: false, error: "Échec de la récupération du membre." }
    }
    if (current.value === null) {
        return { success: false, error: "Membre introuvable." }
    }

    let picturePath = current.value.picturePath

    if (data.picture) {
        const newPath = uniqueFileName(data.picture.name)
        const upload = await tryCatch(
            supabase.storage
                .from("member-pictures")
                .upload(newPath, data.picture, {
                    contentType: data.picture.type
                })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload de la photo." }
        }
        picturePath = upload.value.path

        if (current.value.picturePath.length > 0) {
            await tryCatch(
                supabase.storage
                    .from("member-pictures")
                    .remove([current.value.picturePath])
            )
        }
    }

    const updated = await tryCatch(
        prisma.member.update({
            where: { id: data.id },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                position: data.position,
                picturePath,
                email: data.email,
                facebookUrl: data.facebook || null,
                instagramUrl: data.instagram || null,
                twitterUrl: data.twitter || null
            }
        })
    )
    if (!updated.success) {
        captureActionError(updated.error)
        return { success: false, error: "Échec de la modification du membre." }
    }

    return { success: true }
}

export const editMemberAction = wrapAction(
    "editMemberAction",
    editMemberActionImpl
)
