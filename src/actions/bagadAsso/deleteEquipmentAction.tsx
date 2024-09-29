'use server';

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";

import { revalidatePath } from "next/cache";

export default async function deleteEquipmentAction(prevState: {error?: string, success?: boolean} | undefined, equipmentId: number) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }
    

    // create supabase client
    const supabase = createClient();

    // fetch association to delete
    const equipment = await prisma.bagadAssoEquipment.findUnique({
        where: {
            id: equipmentId
        }
    })

    if(equipment == null) {
        return { error: "Echec de la suppression de l'équipement"}
    }

    /* Remove pictures from storage if there is some */
    if(equipment.imagePath) {
        
        const { data, error } = await supabase.storage.from('equipment-pictures').remove([equipment.imagePath]);

        if(error) {
            console.log(error.message)
            return { error: "Echec de la suppression des images dans la base de données" }
        }

    }

    

    // delete record
    try {
        const deletedRecord = await prisma.bagadAssoEquipment.delete({
            where: {
                id: equipmentId
            }
        });
        revalidatePath('/dashboard/bagadAsso');
        revalidatePath('/bagadAsso')
        return { success : true }

    } catch (_) {
        return {
            error: "Echec de la suppression de l'équipement"
        }
    }
    
}
