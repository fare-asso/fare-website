import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { createClient } from "@/helpers/supabase.server"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import {
    EditPartenaireSchema,
    type TEditPartenaire
} from "@/schemas/partenaires"

type Result = { success: true } | { success: false; error: string }

async function editPartenaireActionImpl(
    input: TEditPartenaire
): Promise<Result> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "edit:partner")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des partenaires"
        }
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
        const newPath = `${randomUUID()}.${fileExt}`
        const upload = await tryCatch(
            supabase.storage
                .from("partner-pictures")
                .upload(newPath, data.logo, { contentType: data.logo.type })
        )
        if (!upload.success) {
            captureActionError(upload.error)
            return { success: false, error: "Échec de l'upload du logo." }
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

const editPartenaireActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof editPartenaireActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "editPartenaireAction",
            editPartenaireActionImpl
        )(
            ...unpackActionArgs<Parameters<typeof editPartenaireActionImpl>>(
                data
            )
        )
    )

export default async (
    ...args: Parameters<typeof editPartenaireActionImpl>
): ReturnType<typeof editPartenaireActionImpl> =>
    editPartenaireActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof editPartenaireActionImpl>
