"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"

async function addPartenaireActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:partner")) {
        return {
            error: "Vous n'avez pas la permission de créer des partenaires"
        }
    }

    const supabase = await createClient()

    const name = formData.get("name")?.toString()
    const description = formData.get("description")?.toString()
    const logoPicture = formData.get("logo-picture")

    if (
        !name ||
        !description ||
        !logoPicture) {
        return {
            error: "Veuillez remplir tous les champs obligatoires."
        }
    }

    const maxFileSize = 15

    if (!(logoPicture instanceof File)) return { error: "Logo non-valide." }

    const file: File = logoPicture

    if (file.size === 0 || file.size / (1024 * 1024) > maxFileSize) {
        return {
            error: `La taille du logo doit être inférieure à ${maxFileSize} Mo.`
        }
    }

    if (
        ![
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif"
        ].includes(file.type)
    ) {
        return {
            error: "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF"
        }
    }

    const { data, error: err } = await supabase.storage
        .from("partner-pictures")
        .upload(randomUUID(), file)
    if (err) {
        return { error: err.message }
    }

    const logoPath: string = data.path

    try {
        const newPartenaire = await prisma.partenaire.create({
            data: {
                name,
                description,
                logoPath
            }
        })

        if (newPartenaire) {
            revalidatePath("/dashboard/partenaires")
            revalidatePath("/a-propos/partenaires")
            return { success: true }
        } else {
            return {
                error: "La création du partenaire dans la base de données a échoué... Veuillez contacter un administrateur."
            }
        }
    } catch (error) {
        captureActionError(error)
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error"
        return { error: errorMessage }
    }
}

export default withServerAction(
    "addPartenaireAction",
    addPartenaireActionImpl,
    { attachFormData: true }
)
