'use server';

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";
import { revalidatePath } from "next/cache";

export default async function deleteCDPAction({id} : {id : number}) {

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
    const {error, data} = await supabase.storage.from('communique-de-presse').remove([deletedCdpRecord.filePath])

    if(error) {
        console.error(error.message);
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