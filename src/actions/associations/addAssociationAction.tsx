import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { AddAssociationSchema } from "@/schemas/associations"

async function addAssociationActionImpl(
    formData: FormData,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "create:association")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des associations"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // validate form data against the shared schema (single source of
    // truth with the client form) ; les réseaux sociaux vides sont omis
    // du FormData par le client
    const data = AddAssociationSchema({
        name: formData.get("name"),
        major: formData.get("major"),
        description: formData.get("description"),
        logo: formData.get("logo-picture"),
        birthdate: formData.get("birthdate"),
        location: formData.get("location"),
        email: formData.get("email"),
        website: formData.get("website") ?? "",
        facebook: formData.get("facebook") ?? "",
        instagram: formData.get("instagram") ?? "",
        twitter: formData.get("twitter") ?? "",
        discord: formData.get("discord") ?? ""
    })
    if (data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    // upload logo picture
    const { data: uploaded, error: err } = await supabase.storage
        .from("association-pictures")
        .upload(randomUUID(), data.logo)
    if (err) {
        captureActionError(err)
        return { success: false, error: "Echec de l'envoi du logo" }
    }

    // create new association record
    const created = await tryCatch(
        prisma.association.create({
            data: {
                name: data.name,
                major: data.major,
                desc: data.description,
                logoPath: uploaded.path,
                birthdate: data.birthdate,
                location: data.location,
                email: data.email,
                website: data.website || null,
                facebook: data.facebook || null,
                instagram: data.instagram || null,
                twitter: data.twitter || null,
                discord: data.discord || null,
                approved: new Date()
            }
        })
    )
    if (!created.success) {
        captureActionError(created.error)
        return {
            success: false,
            error: "Echec de la création de l'association"
        }
    }

    return { success: true }
}

export const addAssociationAction = wrapAction(
    "addAssociationAction",
    addAssociationActionImpl
)
