"use server"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const MemberSchema = z.object({
    lastName: z.string().min(1, "Le nom de famille est obligatoire"),
    firstName: z.string().min(1, "Le prénom est obligatoire"),
    position: z.string().min(1, "Le poste est obligatoire"),
    picturePath: z.string().min(1, "Le chemin de l'image est obligatoire"),
    email: z.string().email("L'email doit être valide"),
    facebook: z
        .string()
        .url("L'URL Facebook doit être valide")
        .optional()
        .or(z.literal("")),
    instagram: z
        .string()
        .url("L'URL Instagram doit être valide")
        .optional()
        .or(z.literal("")),
    twitter: z
        .string()
        .url("L'URL Twitter doit être valide")
        .optional()
        .or(z.literal(""))
})

export default async function addMemberAction(
    formData: FormData
): Promise<{ success?: boolean; error?: string }> {
    // Auth and role verifications
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // Create supabase client
    const supabase = await createClient()

    // Retrieve form data fields
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

    // Validate form data with zod
    const parsed = MemberSchema.safeParse(memberData)
    if (!parsed.success) {
        console.log("Error: ", parsed.error.toString())
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides"
        }
    }

    // Fetch picture info
    const { data, error: pictureError } = await supabase.storage
        .from("member-pictures")
        .info(parsed.data?.picturePath!)

    if (pictureError) {
        return {
            success: false,
            error: "Erreur lors de la récupération de l'image"
        }
    }

    // Create record
    try {
        await prisma.member.create({
            data: {
                firstName: parsed.data.firstName,
                lastName: parsed.data.lastName,
                position: parsed.data.position,
                picturePath: parsed.data.picturePath,
                email: parsed.data.email,
                facebookUrl: parsed.data.facebook,
                instagramUrl: parsed.data.instagram,
                twitterUrl: parsed.data.twitter
            }
        })

        // Revalidate path
        revalidatePath("/dashboard/membres")
        revalidatePath("/bureau")

        return { success: true }
    } catch {
        return {
            success: false,
            error: "La création du membre dans la base de données a échoué... Veuillez contacter un administrateur"
        }
    }
}
