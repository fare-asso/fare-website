import { randomUUID } from "node:crypto"

import { createServerFn } from "@tanstack/react-start"
import { type } from "arktype"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
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
import { AddPartenaireSchema, type TAddPartenaire } from "@/schemas/partenaires"

async function addPartenaireActionImpl(
    input: TAddPartenaire
): Promise<{ success: true } | { success: false; error: string }> {
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:partner")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des partenaires"
        }
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
    const filePath = `${randomUUID()}.${fileExt}`
    const upload = await tryCatch(
        supabase.storage
            .from("partner-pictures")
            .upload(filePath, data.logo, { contentType: data.logo.type })
    )
    if (!upload.success) {
        captureActionError(upload.error)
        return { success: false, error: "Échec de l'upload du logo." }
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
        await supabase.storage.from("partner-pictures").remove([logoPath])
        return {
            success: false,
            error: "Échec de la création du partenaire."
        }
    }

    return { success: true }
}

const addPartenaireActionServerFn = createServerFn({ method: "POST" })
    .validator(
        (data: ActionPayload<Parameters<typeof addPartenaireActionImpl>>) =>
            data
    )
    .handler(({ data }) =>
        withServerAction(
            "addPartenaireAction",
            addPartenaireActionImpl
        )(...unpackActionArgs<Parameters<typeof addPartenaireActionImpl>>(data))
    )

export default async (
    ...args: Parameters<typeof addPartenaireActionImpl>
): ReturnType<typeof addPartenaireActionImpl> =>
    addPartenaireActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof addPartenaireActionImpl>
