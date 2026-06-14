"use server"

import { type } from "arktype"
import { revalidatePath } from "next/cache"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { uniqueFileName } from "@/helpers/storage"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddMemberSchema, type TAddMember } from "@/schemas/members"

async function addMemberActionImpl(
    input: TAddMember
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:member")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des membres"
        }
    }

    const data = AddMemberSchema(input)
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    const supabase = createAdminClient()
    const filePath = uniqueFileName(data.picture.name)
    const upload = await tryCatch(
        supabase.storage
            .from("member-pictures")
            .upload(filePath, data.picture, {
                contentType: data.picture.type
            })
    )
    if (!upload.success) {
        captureActionError(upload.error)
        return { success: false, error: "Échec de l'upload de la photo." }
    }
    const picturePath = upload.value.path

    const created = await tryCatch(
        prisma.member.create({
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
    if (!created.success) {
        captureActionError(created.error)
        await supabase.storage.from("member-pictures").remove([picturePath])
        return { success: false, error: "Échec de la création du membre." }
    }

    revalidatePath("/dashboard/membres")
    revalidatePath("/a-propos/bureau")
    return { success: true }
}

export default withServerAction("addMemberAction", addMemberActionImpl)
