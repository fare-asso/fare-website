import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"
import { EditEquipmentSchema } from "@/schemas/bagadEquipment"

type Result = { success: true } | { success: false; error: string }

export const editEquipmentAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "editEquipmentAction",
            async ({ data: formData }): Promise<Result> => {
                const user = await getCurrentUserWithPermissions()
                if (!user) {
                    return { success: false, error: "Authentification requise" }
                }
                if (!hasPermission(user, "edit:bagad-equipment")) {
                    return {
                        success: false,
                        error: "Vous n'avez pas la permission d'effectuer cette opération"
                    }
                }

                const image = formData.get("image")
                const input = {
                    id: Number(formData.get("id")),
                    name: formData.get("name"),
                    quantity: Number(formData.get("quantity")),
                    deposit: Number(formData.get("deposit")),
                    removeImage: formData.get("removeImage") === "true",
                    image: image instanceof File ? image : undefined
                }

                const data = EditEquipmentSchema(input)
                if (data instanceof type.errors) {
                    return {
                        success: false,
                        error: "Un ou plusieurs champs sont invalides."
                    }
                }

                const current = await tryCatch(
                    prisma.bagadAssoEquipment.findUnique({
                        where: { id: data.id },
                        select: { imagePath: true }
                    })
                )
                if (!current.success) {
                    captureActionError(current.error)
                    return {
                        success: false,
                        error: "Échec de la récupération de l'équipement."
                    }
                }
                if (current.value === null) {
                    return { success: false, error: "Équipement non trouvé." }
                }

                const supabase = createAdminClient()
                const oldImagePath = current.value.imagePath
                let imagePath = oldImagePath
                // Track a fresh upload so we can roll it back if the DB write
                // fails.
                let uploadedPath: string | null = null

                if (data.image) {
                    const fileExt = data.image.name.split(".").pop() ?? "bin"
                    const newPath = `${crypto.randomUUID()}.${fileExt}`
                    const upload = await tryCatch(
                        supabase.storage
                            .from("equipment-pictures")
                            .upload(newPath, data.image, {
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
                    uploadedPath = upload.value.path
                } else if (data.removeImage) {
                    imagePath = null
                }

                const updated = await tryCatch(
                    prisma.bagadAssoEquipment.update({
                        where: { id: data.id },
                        data: {
                            name: data.name,
                            deposit: data.deposit,
                            quantity: data.quantity,
                            imagePath
                        }
                    })
                )
                if (!updated.success) {
                    captureActionError(updated.error)
                    // Roll back the orphaned upload; leave the existing image
                    // intact.
                    if (uploadedPath) {
                        await tryCatch(
                            supabase.storage
                                .from("equipment-pictures")
                                .remove([uploadedPath])
                        )
                    }
                    return {
                        success: false,
                        error: "Echec de la modification de l'équipement. Veuillez réessayer."
                    }
                }

                // The write succeeded — drop the previous image if it is no
                // longer used.
                if (oldImagePath && oldImagePath !== imagePath) {
                    await tryCatch(
                        supabase.storage
                            .from("equipment-pictures")
                            .remove([oldImagePath])
                    )
                }

                return { success: true }
            }
        )
    )
