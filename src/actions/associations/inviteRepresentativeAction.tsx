import { createServerFn } from "@tanstack/react-start"

import { clientEnv } from "@/env/client"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { validateEmail } from "@/helpers/string"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createAdminClient } from "@/helpers/supabase/server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

async function inviteRepresentativeActionImpl(formData: FormData) {
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
        return { error: "Veuillez remplir tous les champs obligatoires." }
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

const inviteRepresentativeActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (
            data: ActionPayload<
                Parameters<typeof inviteRepresentativeActionImpl>
            >
        ) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "inviteRepresentativeAction",
            inviteRepresentativeActionImpl,
            { attachFormData: true }
        )(
            ...unpackActionArgs<
                Parameters<typeof inviteRepresentativeActionImpl>
            >(data)
        )
    )

export default async (
    ...args: Parameters<typeof inviteRepresentativeActionImpl>
): ReturnType<typeof inviteRepresentativeActionImpl> =>
    inviteRepresentativeActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof inviteRepresentativeActionImpl>
