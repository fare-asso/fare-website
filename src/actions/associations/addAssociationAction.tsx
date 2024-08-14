'use server';

import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

export default async function addAssociationAction(prevState: {error?: string, success?: boolean} | undefined, formData: FormData) {
    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const name = formData.get('name')?.toString();
    const major = formData.get('major')?.toString();
    const description = formData.get('description')?.toString();
    const pictures = formData.getAll('pictures');
    const birthdate = formData.get('birthdate')?.toString();
    const location = formData.get('location')?.toString();
    const email = formData.get('email')?.toString();
    const website = formData.get('website')?.toString();
    const facebook = formData.get('facebook')?.toString();
    const instagram = formData.get('instagram')?.toString();
    const twitter = formData.get('twitter')?.toString();
    const discord = formData.get('discord')?.toString();

    // Fields Validation
    if (!name || !major || !description || !pictures.length || !birthdate || !location || !email) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const maxFileSize = 15; // max file size in mb

    for (let picture of pictures) {
        if (!(picture instanceof File)) {
            return { error: "Photo non valide" };
        }
        if (picture.size / (1024 * 1024) > maxFileSize) {
            return { error: `La taille de chaque photo doit être inférieure à ${maxFileSize} Mo.` };
        }
        if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'].includes(picture.type)) {
            return { error: "Le format de l'image doit être : PNG, JPEG, JPG, WebP ou GIF" };
        }
    }

    try {
        const picturePaths = [];
        for (let picture of pictures) {
            const { data, error } = await supabase.storage.from('association-pictures').upload(randomUUID(), picture);
            if (error) {
                return { error: error.message };
            }
            picturePaths.push(data.path);
        }

        const newAssociation = await prisma.association.create({
            data: {
                name,
                major,
                desc: description,
                logoPath: picturePaths,
                birthdate: new Date(birthdate),
                location,
                email,
                website,
                facebook,
                instagram,
                twitter,
                discord
            },
        });

        if (newAssociation) {
            revalidatePath('/dashboard/associations');
            revalidatePath('/reseau');
            return { success: true };
        } else {
            return { error: "La création de l'association dans la base de données a échoué... Veuillez contacter un administrateur." };
        }
    } catch (error: any) {
        return { error: error.message };
    }
}
