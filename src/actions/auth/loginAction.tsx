"use server";

import { createClient } from "@/helpers/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import getCurrentUserRole from "@/helpers/user/role";

interface Data {
    email?: string;
    password?: string;
}

export default async function loginAction(
    currentState: { emailError?: string; passwordError?: string } | undefined,
    formData: FormData,
) {
    const supabase = createClient();

    const email = formData.get("email");
    const password = formData.get("password");

    const credentials: Data = {};

    // TODO: Auth validation for admins
    if (email != null && typeof email == "string") {
        // valid username
        credentials.email = email.toString();
    } else {
        return {
            emailError: "Email incorrect",
        };
    }

    if (password != null && typeof password == "string") {
        // valid password
        credentials.password = password.toString();
    } else {
        return {
            passwordError: "Password incorrect",
        };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
    });

    if (error) {
        if (error.message == "Invalid login credentials") {
            return {
                passwordError: "Mot de passe ou nom d'utilisateur invalide",
            };
        } else {
            return {
                passwordError: "Une erreur inattendue est survenue",
            };
        }
    } else {
        // fetch user role
        const { role, error } = await getCurrentUserRole();

        if (error) {
            return {
                passwordError:
                    "Impossible de récupérer les informations de l'utilisateur",
            };
        }

        if (role === "ASSO_OWNER") {
            revalidatePath("/espace-asso");
            redirect("../espace-asso");
        }

        revalidatePath("/dashboard");
        redirect("../dashboard");
    }

    // if(email === "blasster35@gmail.com") {
    //     redirect("../dashboard")
    // }
    // else {
    //     return {
    //         usernameError: "wrong username",
    //         passwordError: ""
    //     }
    // }
}
