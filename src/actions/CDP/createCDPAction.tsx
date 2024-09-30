'use server';

import { createClient } from "@/helpers/supabase/server";

import prisma from "@/helpers/db";

import { revalidatePath } from "next/cache";
import { sanitizeString } from "@/helpers/string";
import getCurrentUserRole from "@/helpers/user/role";
import { PresseType } from "@prisma/client";

function isPresseType(value: string): value is PresseType {
    return value === "CDP" || value === "DDP";
}

function getPresseType(formData: FormData): PresseType | undefined {
    const value = formData.get('CDPType')?.toString();
    
    if (value && isPresseType(value)) {
        return value;
    }
    
    return undefined;
}

export default async function createCDPAction(prevState: {error?: string, success?: boolean} | undefined, formData: FormData) {

    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if(error) return { error : "Echec de l'authentification de l'utilisateur" }
    if(role != 'ADMIN') return { error : "Vous devez avoir les droits administrateur pour effectuer cette opération." }

    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const name = formData.get('name')?.toString();
    const file = formData.get('CDPfile');
    const date = formData.get('date')?.toString();
    const type: PresseType | undefined = getPresseType(formData)

    const maxFileSize : number = 25 // max pdf size (in mb)

    // Required fields
    if(!name || !type) {
        return { error: "Un ou plusieurs champs sont invalides" }
    }

    // FILE
    if(file != null && file instanceof File) {
        const CDPFile: File = file;
        // check file size
        if(CDPFile.size != 0 && ((CDPFile.size / (1024*1024)) <= maxFileSize)) { // size is lower than 25mb

            if(CDPFile.type == "application/pdf") { // valid format

                // upload file on the S3 storage
                const {error, data} = await supabase.storage.from('communique-de-presse').upload(sanitizeString(name.toString()), CDPFile);

                if(error) {
                    if(error.message == "The resource already exists") {
                        return {
                            error: "Un fichier portant le même nom existe déjà"
                        }
                    } else {
                        console.error(error.message)
                        return {
                            error: "Une erreur est survenue lors de l'upload du document"
                        }
                    }
                    
                } else {

                    // create a record for the new CDP (name, path, date?)
                    const createdCDP = await prisma.communiqueDePresse.create({
                        data: {
                            name: name.toString(),
                            filePath: data.path,
                            size: CDPFile.size,
                            createdAt: date,
                            type: type
                        }
                    });

                    if(createdCDP != null) { // successfully created the record
                        // revalidate cdp page
                        revalidatePath('/dashboard/communiques-de-presse');
                        return {
                            success: true
                        }
                    } else {
                        return {
                            error: `Echec de l'ajout du CDP dans la base de données, veuillez contacter un administrateur (path: ${data.path})`
                        }
                    }

                    
                }

            }
        } else {
            return {
                error: `La taille du fichier doit être inférieure à ${maxFileSize}mo`
            }
        }
    } else {
        return {
            error : "Le fichier n'est pas valide"
        }
    }

}