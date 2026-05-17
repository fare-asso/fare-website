"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { MemberServerSchema } from "@/schemas/members"

async function editMemberActionImpl(formData: FormData, id: number) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:member")) {
        return {
            error: "Vous n'avez pas la permission de modifier des membres"
        }
    }

    const supabase = await createClient()

    // Extraction des données du formulaire
    const memberData = {
        lastName: formData.get("lastName"),
        firstName: formData.get("firstName"),
        position: formData.get("position"),
        picturePath: formData.get("picturePath"),
        email: formData.get("email"),
        facebook: formData.get("facebook"),
        instagram: formData.get("instagram"),
        twitter: formData.get("twitter")
    }

    // Validation des données avec Zod
    const parsed = MemberServerSchema.safeParse(memberData)
    if (!parsed.success) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    // Récupération des informations actuelles du membre
    const currentMember = await prisma.member.findUnique({
        where: { id: Number(id) }
    })

    if (!currentMember) {
        return {
            error: `La récupération des informations du membre (id: ${id}) a échouée.`
        }
    }

    // Vérification si une nouvelle image est fournie
    const newPicturePath = parsed.data.picturePath
    if (currentMember.picturePath !== newPicturePath) {
        // Supprimer l'ancienne image
        const { error: deleteError } = await supabase.storage
            .from("member-pictures")
            .remove([currentMember.picturePath])

        if (deleteError) {
            return {
                success: false,
                error: "Erreur lors de la suppression de l'ancienne image."
            }
        }
    }

    // Mise à jour des informations dans la base de données
    try {
        await prisma.member.update({
            where: { id: Number(id) },
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                position: parsed.data.position,
                picturePath: newPicturePath,
                email: parsed.data.email,
                facebookUrl: parsed.data.facebook,
                instagramUrl: parsed.data.instagram,
                twitterUrl: parsed.data.twitter
            }
        })

        // Révalidation des chemins
        revalidatePath("/dashboard/membres")
        revalidatePath("/a-propos/bureau")

        return { success: true }
    } catch (error) {
        captureActionError(error)
        return {
            success: false,
            error: "La modification du membre dans la base de données a échoué. Veuillez contacter un administrateur."
        }
    }
}

export default withServerAction("editMemberAction", editMemberActionImpl, {
    attachFormData: true
})
