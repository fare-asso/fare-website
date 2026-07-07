import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { uniqueFileName } from "@/helpers/storage"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditMemberSchema } from "@/schemas/members"

type Result = { success: true } | { success: false; error: string }

export const editMemberAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "editMemberAction",
            async ({ data: fd }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:member")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier des membres"
                    }
                }

                const input = {
                    id: Number(fd.get("id")),
                    firstName: fd.get("firstName"),
                    lastName: fd.get("lastName"),
                    position: fd.get("position"),
                    email: fd.get("email"),
                    facebook: fd.get("facebook") ?? "",
                    instagram: fd.get("instagram") ?? "",
                    twitter: fd.get("twitter") ?? "",
                    picture: fd.get("picture") ?? undefined
                }
                const data = EditMemberSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const supabase = createClient()

                const current = await tryCatch(
                    prisma.member.findUnique({
                        where: { id: data.id },
                        select: { picturePath: true }
                    })
                )
                if (!current.success) {
                    captureActionError(current.error)
                    return {
                        success: false,
                        error: "Échec de la récupération du membre."
                    }
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
                        return {
                            success: false,
                            error: "Échec de l'upload de la photo."
                        }
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
                    return {
                        success: false,
                        error: "Échec de la modification du membre."
                    }
                }

                return { success: true }
            }
        )
    )
