"use server";

import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";
import { revalidatePath } from "next/cache";

export default async function editAssociationAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if (error) return { error: "Echec de l'authentification de l'utilisateur" };
    if (role != "ADMIN" && role != "ASSO_OWNER")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération.",
        };

    // create supabase client
    const supabase = await createClient();

    // retrieve form data fields
    const id = Number(formData.get("id")?.toString() ?? NaN);
    const name = formData.get("name")?.toString();
    const major = formData.get("major")?.toString();
    const description = formData.get("description")?.toString();
    const logoPicture = formData.get("logo-picture");
    const birthdate = formData.get("birthdate")?.toString();
    const location = formData.get("location")?.toString();
    const email = formData.get("email")?.toString();
    const website = formData.get("website")?.toString();
    const facebook = formData.get("facebook")?.toString();
    const instagram = formData.get("instagram")?.toString();
    const twitter = formData.get("twitter")?.toString();
    const discord = formData.get("discord")?.toString();

    // fetch current association logo path
    const currentAssociation = await prisma.association.findUnique({
        where: {
            id: id,
        },
        select: {
            logoPath: true,
            officePath: true,
        },
    });

    // validate current association
    if (!currentAssociation)
        return {
            error: "Echec de la récupération des informations l'association",
        };

    // Fields Validation
    if (
        isNaN(id) ||
        !name ||
        !major ||
        !description ||
        !birthdate ||
        !location ||
        !email ||
        !logoPicture
    ) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const maxFileSize = 15; // max file size in mb

    // Logo Picture
    if (!(logoPicture instanceof File)) return { error: "Logo non-valide." };

    const file: File = logoPicture;

    // size validation
    if (file.size == 0 || file.size / (1024 * 1024) > maxFileSize) {
        return {
            error: `La taille de chaque photo doit être inférieure à ${maxFileSize} Mo.`,
        };
    }

    // type validation
    if (
        ![
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "image/gif",
        ].includes(file.type)
    ) {
        return {
            error: "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF",
        };
    }

    // update logo picture
    const { data, error: err } = await supabase.storage
        .from("association-pictures")
        .update(currentAssociation.logoPath, file);
    if (err) return { error: err.message };

    const logoPath: string = data.path;

    try {
        const editedAssociation = await prisma.association.update({
            where: {
                id: id,
            },
            data: {
                name,
                major,
                desc: description,
                logoPath,
                birthdate: new Date(birthdate),
                location,
                email,
                website,
                facebook,
                instagram,
                twitter,
                discord,
            },
        });

        if (editedAssociation) {
            revalidatePath("/dashboard/associations");
            revalidatePath("/reseau");
            return { success: true };
        } else {
            return {
                error: "La modification de l'association dans la base de données a échoué... Veuillez contacter un administrateur.",
            };
        }
    } catch (error: any) {
        return { error: error.message };
    }
}
