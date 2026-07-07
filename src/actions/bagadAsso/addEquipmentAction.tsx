import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { AddEquipmentSchema } from "@/schemas/bagadEquipment"

export const addEquipmentAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "addEquipmentAction",
            async ({
                data: formData
            }): Promise<
                { success: true } | { success: false; error: string }
            > => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "create:bagad-equipment")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission d'effectuer cette opération"
                    }
                }

                const image = formData.get("image")
                const input = {
                    name: formData.get("name"),
                    quantity: Number(formData.get("quantity")),
                    deposit: Number(formData.get("deposit")),
                    image: image instanceof File ? image : undefined
                }

                const data = AddEquipmentSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const supabase = createAdminClient()

                // Optional image upload
                let imagePath: string | null = null
                if (data.image) {
                    const fileExt = data.image.name.split(".").pop() ?? "bin"
                    const filePath = `${crypto.randomUUID()}.${fileExt}`
                    const upload = await tryCatch(
                        supabase.storage
                            .from("equipment-pictures")
                            .upload(filePath, data.image, {
                                contentType: data.image.type
                            })
                    )
                    if (!upload.success) {
                        captureActionError(upload.error)
                        return {
                            success: false,
                            error: "Échec de l'upload de l'image."
                        }
                    }
                    imagePath = upload.value.path
                }

                const created = await tryCatch(
                    prisma.bagadAssoEquipment.create({
                        data: {
                            name: data.name,
                            deposit: data.deposit,
                            quantity: data.quantity,
                            imagePath
                        }
                    })
                )
                if (!created.success) {
                    captureActionError(created.error)
                    if (imagePath) {
                        await supabase.storage
                            .from("equipment-pictures")
                            .remove([imagePath])
                    }
                    return {
                        success: false,
                        error: "Echec de l'ajout de l'équipement. Veuillez réessayer."
                    }
                }

                return { success: true }
            }
        )
    )
