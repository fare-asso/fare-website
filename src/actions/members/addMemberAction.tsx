import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { uniqueFileName } from "@/helpers/storage"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AddMemberSchema } from "@/schemas/members"

export const addMemberAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "addMemberAction",
            async ({
                data: fd
            }): Promise<
                { success: true } | { success: false; error: string }
            > => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "create:member")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de créer des membres"
                    }
                }

                const input = {
                    firstName: fd.get("firstName"),
                    lastName: fd.get("lastName"),
                    position: fd.get("position"),
                    email: fd.get("email"),
                    facebook: fd.get("facebook") ?? "",
                    instagram: fd.get("instagram") ?? "",
                    twitter: fd.get("twitter") ?? "",
                    picture: fd.get("picture") ?? undefined
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
                    return {
                        success: false,
                        error: "Échec de l'upload de la photo."
                    }
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
                    await supabase.storage
                        .from("member-pictures")
                        .remove([picturePath])
                    return {
                        success: false,
                        error: "Échec de la création du membre."
                    }
                }

                return { success: true }
            }
        )
    )
