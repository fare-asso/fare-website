'use server';

import prisma from "@/helpers/db";
import { sanitizeString, validateEmail } from "@/helpers/string";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserRole from "@/helpers/user/role";
import { error } from "console";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

interface Member {
    lastName?: string,
    firstName?: string,
    position?: string,
    pictureUrl?: string,
    email?: string,
    facebook?: string,
    instagram?: string,
    twitter?: string
}

export default async function addMemberAction(prevState: {error?: string, success?: boolean,} | undefined,formData: FormData) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }

    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const lastName = formData.get('last-name');
    const firstName = formData.get('first-name');
    const position = formData.get('position');
    const pictureFile = formData.get('picture');
    const email = formData.get('email');
    const facebook = formData.get('facebook');
    const instagram = formData.get('instagram');
    const twitter = formData.get('twitter');

    // Temp variable to store form data
    const temp : Member = {}


    // Fields Validation

    const maxFileSize : number = 10 // in mb

    if(lastName != null && typeof lastName == "string") {
        temp.lastName = lastName.toString();
    } else {
        return {
            error: "Nom invalide"
        }
    }

    if(firstName != null && typeof firstName == "string") {
        temp.firstName = firstName.toString();
    } else {
        return {
            error: "Prénom invalide"
        }
    }

    if(position != null && typeof position == "string") {
        temp.position = position.toString();
        if(temp.position == "") {
            return {
                error : "Fonction non-valide"
            }
        }
    } else {
        return {
            error: "Fonction non-valide"
        }
    }

    if(email != null && typeof email == "string") {
        temp.email = email.toString();
        if(!validateEmail(temp.email)) {
            return {
                error: "Adresse email non-valide"
            }
        }
    } else {
        return {
            error: "Email non valide"
        }
    }

    if(facebook != null && typeof facebook == "string") {
        temp.facebook = facebook.toString();
    }

    if(instagram != null && typeof instagram == "string") {
        temp.instagram = instagram.toString();
    }

    if(twitter != null && typeof twitter == "string") {
        temp.twitter = twitter.toString();
    }

    if(!(pictureFile != null && pictureFile instanceof File)) {
        return { error : "Photo non valide" }
    }

    const file: File = pictureFile;

    // check file validity and size
    if(!(file.size != 0 && ((file.size / (1024*1024)) <= maxFileSize))) { // valid file and size <= max file size
        return { error: `La taille de la photo doit être inférieure à ${maxFileSize}` }
    }
    
    // check file format
    if(!file.type.startsWith('image/')) {
        return { error: "Le format de l'image doit être : png, jpeg, jpg, webp ou gif" }
    }

    // upload image
    const { error: uploadError, data: uploadData } = await supabase.storage.from('member-pictures').upload(randomUUID(), file);
    if(uploadError) {
        return { error : uploadError.message }
    } else { // upload success

        // create record
        const newMemberRecord = await prisma.member.create({
            data: {
                firstName : temp.firstName,
                lastName: temp.lastName,
                position: temp.position,
                picturePath: uploadData.path,
                email: temp.email,
                facebookUrl: temp.facebook,
                instagramUrl: temp.instagram,
                twitterUrl: temp.twitter

            }
        })

        if(newMemberRecord) { // record has been created

            // revalidate path
            revalidatePath('/dashboard/membres');
            revalidatePath('/bureau');

            return { success : true
            }
        } else {
            return {
                error: "La création du membre dans la base de données à échoué... Veuillez contacter un administrateur"
            }
        }
    }

}