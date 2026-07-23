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
        website: formData.get("website"),
        facebook: formData.get("facebook"),
        instagram: formData.get("instagram"),
        twitter: formData.get("twitter"),
        discord: formData.get("discord"),
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
    const currentAssociation = await prisma.association.findUnique({
        where: {
            id: id
        },
        select: {
            logoPath: true,
            officePath: true
        }
    })

    // validate current association
    if (!currentAssociation)
        return {
            success: false,
            error: "Echec de la récupération des informations l'association"
        }

    let logoPath: string = currentAssociation.logoPath

    if (data.logo) {
        // update logo picture
        const { data: uploaded, error: err } = await supabase.storage
            .from("association-pictures")
            .update(currentAssociation.logoPath, data.logo)
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
                website: data.website,
                facebook: data.facebook,
                instagram: data.instagram,
                twitter: data.twitter,
                discord: data.discord
            }
        })
    )
    if (!edited.success) {
        captureActionError(edited.error)
        return {
            success: false,
            error: "Echec de la modification de l'association"
        }
    }

    return { success: true }
}

export const editAssociationAction = wrapAction(
    "editAssociationAction",
    editAssociationActionImpl
)
