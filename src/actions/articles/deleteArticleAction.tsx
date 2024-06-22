
'use server';

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";

import { revalidatePath } from "next/cache";

export default async function deleteArticleAction(prevState: {error?: string, success?: boolean} | undefined, id: number) {

    // create supabase client
    const supabase = createClient();

    // fetch article to delete
    const article = await prisma.article.findUnique({
        where: {
            id: id
        }
    })

    if(article == null) {
        return { error: "Echec de la suppression de l'article"}
    }

    /* Remove pictures from storage if there is some */
    if(article.imagesPath.length > 0) {
        
        const { data, error } = await supabase.storage.from('article-pictures').remove(article.imagesPath);

        if(error) {
            console.log(error.message)
            return { error: "Echec de la suppression des images dans la base de données" }
        } // else success

    }

    

    // delete record
    try {
        const deletedRecord = await prisma.article.delete({
            where: {
                id: id
            }
        });
        revalidatePath('/dashboard/articles');
        return { success : true }

    } catch (_) {
        return {
            error: "Echec de la suppression de l'article"
        }
    }
    
}
