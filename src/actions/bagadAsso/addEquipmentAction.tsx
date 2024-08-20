'use server';

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";

import prisma from "@/helpers/db";

import { revalidatePath } from "next/cache";

import { randomUUID } from "crypto";


export default async function addEquipmentAction(prevState: {error?: string, success?: boolean} | undefined, formData: FormData) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }


    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const name = formData.get('name')?.toString();
    const image = formData.get('equipment-picture');
    const quantity = formData.get('quantity')?.toString();
    const guarantee = formData.get('guarantee')?.toString();

    // data validation
    if(!name || !image || !quantity || !guarantee) {
        return {
            error: "Un ou plusieurs champs ne sont pas remplis."
        }
    }

    // Name
    if(!(name.length > 0)) return { error: "La longueur du nom ne doit pas être vide" }

    // Quantity
    if(isNaN(Number(quantity))) return { error : "Champs 'quantité' non-valide." }

    // Guarantee
    if(isNaN(Number(guarantee))) return { error : "Champs 'caution' non-valide." }

    // Image
    const maxFileSize : number = 25 // max image size (in mb)
    if(image instanceof File) {
        const file: File = image;

        // check file size and format
        if(file.size == 0 && ((file.size / (1024 * 1024)) >= maxFileSize) && file.type.startsWith('image/')) {
            return { error : "La taille ou le format de l'image n'est pas valide. La taille doit être inférieure à 25mo et les formats supportés sont \"jpg, jpeg, png, gif et webp\"." }
        }

        // upload file
        const { error, data } = await supabase.storage.from('equipment-pictures').upload(randomUUID(), file);

        if(error) return { error: error.message }

        const imagePath = data.path;

        // create new record
        try {
            const createdRecord = await prisma.bagadAssoEquipment.create({
                data: {
                    name,
                    deposit: Number(guarantee),
                    quantity: Number(quantity),
                    imagePath
                }
            })

            revalidatePath("/dashboard/bagadAsso");
            revalidatePath('/bagadAsso')
            return { success: true }

        } catch (error) { // Failed
            return { error : "Echec de l'ajout de l'équipement. Veuillez réessayer." }
        }


    }

}