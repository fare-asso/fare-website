'use server';

import prisma from "@/helpers/db";
import { sanitizeString, validateEmail } from "@/helpers/string";

import { createClient } from "@/helpers/supabase/server";
import { revalidatePath } from "next/cache";

interface Member {
    lastName?: string,
    firstName?: string,
    position?: string,
    picturePath?: string,
    email?: string,
    facebook?: string,
    instagram?: string,
    twitter?: string
}

export default async function editMemberAction(prevState: {error?: string, success?: boolean,} | undefined,formData: FormData) {

    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const id = formData.get('id');
    const lastName = formData.get('last-name');
    const firstName = formData.get('first-name');
    const position = formData.get('position');
    const pictureFile = formData.get('picture');
    const email = formData.get('email');
    const facebook = formData.get('facebook');
    const instagram = formData.get('instagram');
    const twitter = formData.get('twitter');

    console.log("Picture File: " + pictureFile);

    // Temp variable to store form data
    const temp : Member = {}

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

    if(pictureFile != null && pictureFile instanceof File) {
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
                    temp.picturePath = data.path;
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
    const newMemberRecord = await prisma.member.update({
        where: {
            id: Number(id)
        },
        data: {
            firstName : temp.firstName,
            lastName: temp.lastName,
            position: temp.position,
            picturePath: temp.picturePath ? temp.picturePath : currentMember.picturePath,
            email: temp.email,
            facebookUrl: temp.facebook,
            instagramUrl: temp.instagram,
            twitterUrl: temp.twitter
        }
    })

    if(newMemberRecord != null) { // record has been created

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