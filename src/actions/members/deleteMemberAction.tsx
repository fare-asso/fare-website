"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/helpers/db"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { createClient } from "@/helpers/supabase/server"

export default async function deleteMemberAction({ id }: { id: number }) {
    // Auth and permission verifications
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { error: "Authentification requise" }
    }
    if (!hasPermission(user, "delete:member")) {
        return {
            error: "Vous n'avez pas la permission de supprimer des membres"
        }
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
