"use server";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";
import { redirect } from "next/navigation";

export default async function createPasswordForRepresentativeAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error: err } = await getCurrentUserRole();
    if (err) return { error: "Echec de l'authentification de l'utilisateur" };
    if (role != "ASSO_OWNER")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération.",
        };

    // create supabase client
    const supabase = await createClient();

    // retrieve formdata fields
    const password = formData.get("password")?.toString();
    const passwordConf = formData.get("passwordConf")?.toString();

    // check password and passwordConf nullity
    if (!password || !passwordConf) {
        return { error: "Mot de passe non valide" };
    }

    // password must have at least 8 characters
    if (password.length < 8) {
        return {
            error: "La longueur du mot de passe doit être d'au moins 8 caractères",
        };
    }

    // password and passwordConf are not identical
    if (password != passwordConf) {
        return {
            error: "Le mot de passe et la confirmation du mot de passe ne sont pas identiques",
        };
    }

    // set password
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) {
        return {
            error: "Echec de la création du mot de passe, veuillez contacter un administrateur",
        };
    }

    redirect("/espace-asso");
}
