'use server';

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";
import { revalidatePath } from "next/cache";

export default async function deleteCDPAction({id} : {id : number}) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }
    

    // create supabase client
    const supabase = createClient();

    // Delete Record from DB
    const deletedCdpRecord = await prisma.communiqueDePresse.delete({
        where : {
            id: id
        }
    })

    if(deletedCdpRecord == null) {
        return {
            error : "Echec de la suppression du communiqué de presse"
        }
    }

    // remove file from storage
    const {error: err, data} = await supabase.storage.from('communique-de-presse').remove([deletedCdpRecord.filePath])

    if(err) {
        console.error(err.message);
        return {
            error: "Echec de la suppression du communiqué de presse dans le stockage"
        }
    } else { // success

        // revalidate Path
        revalidatePath('/dashboard/communiques-de-presse');
        return {
            success: true
        }
    }

    

}