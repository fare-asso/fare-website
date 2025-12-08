import type { Role } from "@prisma/client"
import prisma from "../db"
import { createClient } from "../supabase/server"

export default async function getCurrentUserRole(): Promise<{
    role?: Role
    error?: string
}> {
    // create supabase client
    const supabase = await createClient()

    // fetch current user
    const {
        data: { user },
        error
    } = await supabase.auth.getUser()

    if (user) {
        // fetch User in the public db with auth user id
        const pUser = await prisma.user.findUniqueOrThrow({
            where: {
                id: user.id
            }
        })

        if (pUser) {
            // is valid user
            return {
                role: pUser.role as Role
            }
        } else {
            return {
                error: "L'utilisateur n'est pas trouvé dans la base de données"
            }
        }
    } else {
        // User Session is not valid
        return {
            error: "L'utilisateur n'est pas authentifié"
        }
    }
}
