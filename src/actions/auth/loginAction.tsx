"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/helpers/supabase/server"
import getCurrentUserRole from "@/helpers/user/role"

export default async function loginAction(
    _currentState: { emailError?: string; passwordError?: string } | undefined,
    formData: FormData
) {
    const supabase = await createClient()

    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    // Fields validation
    if (!email) {
        return {
            emailError: "Veuillez entrer une adresse email"
        }
    }

    if (!password) {
        return {
            passwordError: "Veuillez entrer un mot de passe"
        }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    // Check if the user is authenticated and handle errors
    if (error) {
        console.log(error.code)
        switch (error.code) {
            case "invalid_credentials":
                return {
                    passwordError: "Mot de passe ou nom d'utilisateur invalide"
                }
            default:
                return {
                    passwordError: "Une erreur inattendue est survenue"
                }
        }
    }

    // fetch user role
    const { role, error: roleError } = await getCurrentUserRole()

    if (roleError) {
        return {
            passwordError:
                "Impossible de récupérer les informations de l'utilisateur"
        }
    }

    // Redirect user based on their role
    switch (role) {
        case "ADMIN":
            revalidatePath("/dashboard")
            redirect("/dashboard")
            break
        case "ASSO_OWNER":
            revalidatePath("/espace-asso")
            redirect("/espace-asso")
            break
        case "MEMBER":
            revalidatePath("/dashboard")
            redirect("/dashboard")
            break
    }
}
