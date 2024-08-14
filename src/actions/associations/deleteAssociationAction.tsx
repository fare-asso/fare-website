'use server';

import prisma from "@/helpers/db";

import { createAdminClient, createClient } from "@/helpers/supabase/server";

import { revalidatePath } from "next/cache";

export default async function deleteAssociationAction(prevState: {error?: string, success?: boolean} | undefined, id: number) {

    // create supabase client
    const supabase = createClient();

    // create supabase admin client (only on server)
    const supabaseAdmin = createAdminClient();

    // fetch association to delete
    const association = await prisma.association.findUnique({
        where: {
            id: id
        }
    })

    if(association == null) {
        return { error: "Echec de la suppression de l'association"}
    }

    /* Remove representative */
    if(association.representativeId) {
        try {
            const removedRepresentative = await supabaseAdmin.auth.admin.deleteUser(association.representativeId);
        } catch (error) {
            console.error(error);
            return {
                error: "Echec de la suppression du compte représentant"
            }
        }
        
    }

    /* Remove pictures from storage if there is some */
    if(association.logoPath.length > 0) {
        
        const { data, error } = await supabase.storage.from('association-pictures').remove(association.logoPath);

        if(error) {
            console.log(error.message)
            return { error: "Echec de la suppression des images dans la base de données" }
        } // else success

    }

    

    // delete record
    try {
        const deletedRecord = await prisma.association.delete({
            where: {
                id: id
            }
        });
        revalidatePath('/dashboard/associations');
        revalidatePath('/reseau')
        return { success : true }

    } catch (_) {
        return {
            error: "Echec de la suppression de l'association"
        }
    }
    
}
