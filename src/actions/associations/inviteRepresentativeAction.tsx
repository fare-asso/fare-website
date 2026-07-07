import { createServerFn } from "@tanstack/react-start"

import { clientEnv } from "@/env/client"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { validateEmail } from "@/helpers/string"
import { createAdminClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { captureActionError, withServerAction } from "@/lib/sentry.server"
import { tryCatch } from "@/lib/utils"

export const inviteRepresentativeAction = createServerFn({ method: "POST" })
    .validator((data: FormData) => data)
    .handler(
        withServerAction(
            "inviteRepresentativeAction",
            async ({ data: formData }) => {
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
                const supabase = createAdminClient()

                /* Data Validation */
                const email = formData.get("email")?.toString()
                const associationId = formData.get("associationId")?.toString()

                if (!email) {
                    return {
                        error: "Veuillez remplir tous les champs obligatoires."
                    }
                }

                if (!validateEmail(email)) {
                    return { error: "Adresse E-mail non valide." }
                }

                /* Invite Representative and Set User role to ASSO_OWNER */
                // Send Invitation By Email
                const invited = await tryCatch(
                    supabase.auth.admin.inviteUserByEmail(email, {
                        redirectTo: `${clientEnv.VITE_SITE_URL}/espace-asso/create-password`
                    })
                )
                if (!invited.success) {
                    const err = invited.error
                    if (
                        err &&
                        typeof err === "object" &&
                        "code" in err &&
                        err.code === "email_exists"
                    ) {
                        return { error: "Cet utilisateur existe déjà" }
                    }
                    captureActionError(err)
                    return { error: "Echec de l'invitation du représentant" }
                }
                const { user: invitedUser } = invited.value

                const userUpdate = await tryCatch(
                    prisma.user.update({
                        where: {
                            id: invitedUser.id
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
                            representativeId: invitedUser.id
                        }
                    })
                )
                if (!assoUpdate.success) {
                    captureActionError(assoUpdate.error)
                    return { error: "Echec de l'invitation du représentant" }
                }

                return { success: true }
            }
        )
    )
