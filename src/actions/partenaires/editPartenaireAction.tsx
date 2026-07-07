import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditPartenaireSchema } from "@/schemas/partenaires"

type Result = { success: true } | { success: false; error: string }

export const editPartenaireAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "editPartenaireAction",
            async ({ data: fd }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:partner")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de modifier des partenaires"
                    }
                }

                const input = {
                    id: Number(fd.get("id")),
                    name: fd.get("name"),
                    description: fd.get("description"),
                    logo: fd.get("logo") ?? undefined
                }
                const data = EditPartenaireSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const supabase = createClient()

                const current = await tryCatch(
                    prisma.partenaire.findUnique({
                        where: { id: data.id },
                        select: { logoPath: true }
                    })
                )
                if (!current.success) {
                    captureActionError(current.error)
                    return {
                        success: false,
                        error: "Échec de la récupération du partenaire."
                    }
                }

                if (current.value === null) {
                    return { success: false, error: "Partenaire introuvable." }
                }

                let logoPath = current.value.logoPath

                if (data.logo) {
                    const fileExt = data.logo.name.split(".").pop() ?? "bin"
                    const newPath = `${crypto.randomUUID()}.${fileExt}`
                    const upload = await tryCatch(
                        supabase.storage
                            .from("partner-pictures")
                            .upload(newPath, data.logo, {
                                contentType: data.logo.type
                            })
                    )
                    if (!upload.success) {
                        captureActionError(upload.error)
                        return {
                            success: false,
                            error: "Échec de l'upload du logo."
                        }
                    }
                    logoPath = upload.value.path

                    if (current.value.logoPath.length > 0) {
                        await tryCatch(
                            supabase.storage
                                .from("partner-pictures")
                                .remove([current.value.logoPath])
                        )
                    }
                }

                const updated = await tryCatch(
                    prisma.partenaire.update({
                        where: { id: data.id },
                        data: {
                            name: data.name,
                            description: data.description,
                            logoPath
                        }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    return {
                        success: false,
                        error: "Échec de la modification du partenaire."
                    }
                }

                return { success: true }
            }
        )
    )
