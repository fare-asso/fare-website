import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AddPartenaireSchema } from "@/schemas/partenaires"

export const addPartenaireAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "addPartenaireAction",
            async ({
                data: fd
            }): Promise<
                { success: true } | { success: false; error: string }
            > => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "create:partner")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission de créer des partenaires"
                    }
                }

                const input = {
                    name: fd.get("name"),
                    description: fd.get("description"),
                    logo: fd.get("logo") ?? undefined
                }
                const data = AddPartenaireSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const supabase = createAdminClient()
                const fileExt = data.logo.name.split(".").pop() ?? "bin"
                const filePath = `${crypto.randomUUID()}.${fileExt}`
                const upload = await tryCatch(
                    supabase.storage
                        .from("partner-pictures")
                        .upload(filePath, data.logo, {
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
                const logoPath = upload.value.path

                const created = await tryCatch(
                    prisma.partenaire.create({
                        data: {
                            name: data.name,
                            description: data.description,
                            logoPath
                        }
                    })
                )
                if (!created.success) {
                    captureActionError(created.error)
                    await supabase.storage
                        .from("partner-pictures")
                        .remove([logoPath])
                    return {
                        success: false,
                        error: "Échec de la création du partenaire."
                    }
                }

                return { success: true }
            }
        )
    )
