"use server"

import { revalidatePath } from "next/cache"

import { env } from "@/env"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { validateEmail } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient } from "@/helpers/supabase/server"
import { captureActionError, withServerAction } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function inviteRepresentativeActionImpl(
    _prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "invite:representative")) {
        return {
            error: "Vous n'avez pas la permission d'inviter des représentants"
        }
    }

    // supabase Admin client
    const supabase = await createAdminClient()

    /* Data Validation */
    const email = formData.get("email")?.toString()
    const associationId = formData.get("associationId")?.toString()

    if (!email) {
        return { error: "Veuillez remplir tous les champs obligatoires." }
    }

    if (!validateEmail(email)) {
        return { error: "Adresse E-mail non valide." }
    }

    /* Invite Representative and Set User role to ASSO_OWNER */
    // Send Invitation By Email
    const invited = await tryCatch(
        supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/espace-asso/create-password`
        })
    )
    if (!invited.success) {
        captureActionError(invited.error)
        return { error: "Echec de l'invitation du représentant" }
    }
    const { data, error } = invited.value

    if (error) {
        // failed to send invitation
        if (error.code === "email_exists") {
            return { error: "Cet utilisateur existe déjà" }
        } else {
            console.error(error)
            return { error: "Echec de l'invitation du représentant" }
        }
    }

    // invitation has been sent
    const userUpdate = await tryCatch(
        prisma.user.update({
            where: {
                id: data.user.id
            },
            data: {
                role: "ASSO_OWNER"
            }
        })
    )
    if (!userUpdate.success) {
        captureActionError(userUpdate.error)
        return { error: "Echec de l'invitation du représentant" }
    }

    // update asso representative
    const assoUpdate = await tryCatch(
        prisma.association.update({
            where: {
                id: Number(associationId)
            },
            data: {
                representativeId: data.user.id
            }
        })
    )
    if (!assoUpdate.success) {
        captureActionError(assoUpdate.error)
        return { error: "Echec de l'invitation du représentant" }
    }

    revalidatePath("/dashboard/associations")
    return { success: true }
}

export default withServerAction(
    "inviteRepresentativeAction",
    inviteRepresentativeActionImpl,
    { attachFormData: true }
)
