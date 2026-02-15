"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function deleteMemberAction({ id }: { id: number }) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role !== "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

    const res = await prisma.member.delete({
        where: { id: id }
    })

    if (res != null) {
        // successfully deleted

        const { error } = await supabase.storage
            .from("member-pictures")
            .remove([res.picturePath])

        if (error) {
            return { error: error.message }
        } else {
            revalidatePath("/dashboard/membres")
            revalidatePath("/a-propos/bureau")
            return { success: true }
        }
    } else return { error: "Failed to delete record" }
}
