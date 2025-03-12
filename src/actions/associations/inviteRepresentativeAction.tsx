"use server";

import prisma from "@/helpers/db";

import { createAdminClient } from "@/helpers/supabase/server";

import { validateEmail } from "@/helpers/string";
import getCurrentUserRole from "@/helpers/user/role";
import { revalidatePath } from "next/cache";

export default async function inviteRepresentativeAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if (error) return { error: "Echec de l'authentification de l'utilisateur" };
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération.",
        };

    // supabase Admin client
    const supabase = await createAdminClient();

    /* Data Validation */
    const email = formData.get("email")?.toString();
    const associationId = formData.get("associationId")?.toString();

    if (!email) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    if (!validateEmail(email)) {
        return { error: "Adresse E-mail non valide." };
    }

    /* Invite Representative and Set User role to ASSO_OWNER */
    try {
        // Send Invitation By Email
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: "http://localhost:3000/espace-asso/create-password",
            },
        );

        if (error) {
            // failed to send invitation

            if (error.code == "email_exists") {
                return { error: "Cet utilisateur existe déjà" };
            } else {
                console.error(error);
                return { error: "Echec de l'invitation du représentant" };
            }
        } else {
            // invitation has been sent
            const currentUser = await prisma.user.update({
                where: {
                    id: data.user.id,
                },
                data: {
                    role: "ASSO_OWNER",
                },
            });

            // update asso representative
            const updatedAsso = await prisma.association.update({
                where: {
                    id: Number(associationId),
                },
                data: {
                    representativeId: data.user.id,
                },
            });

            revalidatePath("/dashboard/associations");
            return {
                success: true,
            };
        }
    } catch (error: any) {
        console.error(error);
        return { error: "Echec de l'invitation du représentant" };
    }
}
