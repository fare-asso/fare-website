import { randomUUID } from "node:crypto"

import { type } from "arktype"
import type { ActionAPIContext } from "astro:actions"

import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { createClient, getUserWithPermissions } from "@/helpers/supabase/astro"
import { wrapAction, type ActionResult } from "@/lib/action"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"
import { EditAssociationSchema } from "@/schemas/associations"

async function editAssociationActionImpl(
    formData: FormData,
    context: ActionAPIContext
): Promise<ActionResult> {
    // Auth and permission verifications
    const user = await getUserWithPermissions(context)
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }
    if (!hasPermission(user, "edit:association")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de modifier des associations"
        }
    }

    // create supabase client
    const supabase = createClient(context)

    // validate form data against the shared schema (single source of
    // truth with the client form)
    const id = Number(formData.get("id")?.toString() ?? Number.NaN)
    const logoPicture = formData.get("logo-picture")
    const data = EditAssociationSchema({
        name: formData.get("name"),
        major: formData.get("major"),
        description: formData.get("description"),
        birthdate: formData.get("birthdate"),
        location: formData.get("location"),
        email: formData.get("email"),
        website: formData.get("website") ?? "",
        facebook: formData.get("facebook") ?? "",
        instagram: formData.get("instagram") ?? "",
        twitter: formData.get("twitter") ?? "",
        discord: formData.get("discord") ?? "",
        // Logo optionnel : sans nouveau fichier, le logo actuel est conservé
        ...(logoPicture === null || logoPicture === ""
            ? {}
            : { logo: logoPicture })
    })
    if (Number.isNaN(id) || data instanceof type.errors) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    // fetch current association logo path
    const currentAssociation = await tryCatch(
        prisma.association.findUnique({
            where: {
                id: id
            },
            select: {
                logoPath: true,
                officePath: true
            }
        })
    )
    if (!currentAssociation.success) {
        captureActionError(currentAssociation.error)
        return {
            success: false,
            error: "Echec de la récupération des informations de l'association"
        }
    }
    if (!currentAssociation.value) {
        return {
            success: false,
            error: "Echec de la récupération des informations de l'association"
        }
    }

    const previousLogoPath = currentAssociation.value.logoPath
    let logoPath = previousLogoPath

    if (data.logo) {
        // nouveau chemin (et non écrasement en place) : l'ancien logo
        // reste intact si la mise à jour en base échoue, et l'URL
        // publique change, ce qui invalide les caches navigateur/CDN
        const { data: uploaded, error: err } = await supabase.storage
            .from("association-pictures")
            .upload(randomUUID(), data.logo)
        if (err) {
            captureActionError(err)
            return {
                success: false,
                error: "Echec de la mise à jour du logo"
            }
        }

        logoPath = uploaded.path
    }

    const edited = await tryCatch(
        prisma.association.update({
            where: {
                id: id
            },
            data: {
                name: data.name,
                major: data.major,
                desc: data.description,
                logoPath,
                birthdate: data.birthdate,
                location: data.location,
                email: data.email,
                website: data.website || null,
                facebook: data.facebook || null,
                instagram: data.instagram || null,
                twitter: data.twitter || null,
                discord: data.discord || null
            }
        })
    )
    if (!edited.success) {
        captureActionError(edited.error)
        if (logoPath !== previousLogoPath) {
            // best-effort : ne pas laisser le nouveau logo orphelin
            await supabase.storage
                .from("association-pictures")
                .remove([logoPath])
        }
        return {
            success: false,
            error: "Echec de la modification de l'association"
        }
    }

    if (logoPath !== previousLogoPath) {
        // best-effort : l'ancien logo n'est plus référencé
        await supabase.storage
            .from("association-pictures")
            .remove([previousLogoPath])
    }

    return { success: true }
}

export const editAssociationAction = wrapAction(
    "editAssociationAction",
    editAssociationActionImpl
)
