'use server';

import prisma from "@/helpers/db";
import { validateEmail } from "@/helpers/string";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";
import { revalidatePath } from "next/cache";


export default async function editMemberAction(prevState: {error?: string, success?: boolean,} | undefined,formData: FormData) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }


    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const id = formData.get('id')?.toString();
    const lastName = formData.get('last-name')?.toString();
    const firstName = formData.get('first-name')?.toString();
    const position = formData.get('position')?.toString();
    const pictureFile = formData.get('picture');
    const email = formData.get('email')?.toString();
    const facebook = formData.get('facebook')?.toString();
    const instagram = formData.get('instagram')?.toString();
    const twitter = formData.get('twitter')?.toString();

    if(!id || !lastName || !firstName || !position || !pictureFile || !email) {
        return {
            error: "Un ou plusieurs champs obligatoires ne sont pas remplis"
        }
    }

    // fetch current record
    const currentMember = await prisma.member.findUnique({
        where : {
            id: Number(id)
        }
    })

    if(currentMember == null) {
        return {
            error: "La récupération des informations du membre (id: " + id?.toString() + ") a échouée"
        }
    }

    // Fields Validation

    const maxFileSize : number = 15 // in mb

    if(!validateEmail(email)) {
        return {
            error: "Adresse email non-valide"
        }
    }

    let picturePath: string | undefined = undefined;

    if(pictureFile && pictureFile instanceof File) {
        const file: File = pictureFile;
        // check file validity and size
        if(file.size != 0 && ((file.size / (1024*1024)) <= maxFileSize)) { // valid file and size <= max file size

            // check file format
            if(file.type.startsWith('image/')) {

                // update image
                const { error, data } = await supabase.storage.from('member-pictures').update(currentMember.picturePath, file);

                if(error) { // upload failed
                    console.log(error.message)
                    return {
                        error : error.message
                    }
                } else { // upload success
                    picturePath = data.path;
                }
            } else {
                return {
                    error: "Le format de l'image doit être : png, jpeg, jpg, webp ou gif"
                }
            }
        } else {
            console.error("Taille de l'image non valide")
        }
    } else {
        console.error("Image non valide")
    }

    // update record
    const updatedMemberRecord = await prisma.member.update({
        where: {
            id: Number(id)
        },
        data: {
            firstName : firstName,
            lastName: lastName,
            position: position,
            picturePath: picturePath,
            email: email,
            facebookUrl: facebook,
            instagramUrl: instagram,
            twitterUrl: twitter
        }
    })

    if(updatedMemberRecord != null) { // record has been created

        // revalidate path
        revalidatePath('/dashboard/membres');

        return {
            success : true
        }
    } else {
        return {
            error: "La modification du membre dans la base de données à échoué... Veuillez contacter un administrateur"
        }
    }

}