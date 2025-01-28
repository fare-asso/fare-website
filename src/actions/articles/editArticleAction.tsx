"use server";

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";

import { StorageError } from "@supabase/storage-js";

import { randomUUID } from "crypto";

import { DeltaStatic } from "quill";

import { base64ToFile } from "@/helpers/image";
import getCurrentUserId from "@/helpers/user/id";
import { Article } from "@/components/dashboard/Articles/articleList";
import { revalidatePath } from "next/cache";
import getCurrentUserRole from "@/helpers/user/role";

export default async function createArticleAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if (error) return { error: "Echec de l'authentification de l'utilisateur" };
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération.",
        };

    // create supabase client
    const supabase = createClient();

    // retrieve form data fields
    const id: number | undefined =
        isNaN(Number(formData.get("id"))) ? undefined : (
            Number(formData.get("id"))
        );
    const title = formData.get("title")?.toString();
    const content = formData.get("delta")?.toString();
    const date = formData.get("date")?.toString();

    // Fields Validation
    if (!title || !content || !id || !date) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    const currentArticle: Article | null = await prisma.article.findUnique({
        where: {
            id: id!,
        },
    });

    if (currentArticle == null) {
        return { error: "L'article est introuvable..." };
    }

    const contentDelta: DeltaStatic = await JSON.parse(content);

    if (contentDelta.ops && contentDelta.ops.length > 0) {
        // content is not null

        /* Filter all operations that contains images */

        const opsLength: number = contentDelta.ops.length;
        const b64Images: Map<number, string> = new Map<number, string>(); // number is operation index and string is the base64 image

        for (let i = 0; i < opsLength; i++) {
            // iterate throught all operations
            const currentOp = contentDelta.ops[i].insert;
            if (currentOp.image) {
                // current operation is an image
                b64Images.set(i, currentOp.image);
            }
        }

        /* Convert those images to File type */

        const imageFiles: File[] = [];
        b64Images.forEach((image, index) => {
            imageFiles.push(base64ToFile(image, "image" + index));
        });

        if (currentArticle.imagesPath.length > 0) {
            /* Delete previous images */
            console.log(currentArticle.imagesPath);
            const res = await supabase.storage
                .from("article-pictures")
                .remove(currentArticle.imagesPath);
            if (res.error) {
                console.log(res.error.message);
                return {
                    error: "Echec de la suppression de images précédentes",
                };
            }
        }

        /* Upload those images on the storage and save to path */

        const imagePaths: string[] = [];

        const responses: (
            | { data: { path: string }; error: null }
            | { data: null; error: StorageError }
        )[] = await Promise.all(
            imageFiles.map(
                async (file) =>
                    await supabase.storage
                        .from("article-pictures")
                        .upload(randomUUID() + file.name, file),
            ),
        );

        responses.forEach((value) => {
            if (value.error) {
                return {
                    error: "L'upload des images a échoué. Veuillez réessayer",
                };
            } else {
                imagePaths.push(value.data.path);
            }
        });

        /* Replace base64 in the Delta with url  */

        let i = 0;
        b64Images.forEach((value, index) => {
            contentDelta.ops![index].insert = {
                image: supabase.storage
                    .from("article-pictures")
                    .getPublicUrl(imagePaths[i]).data.publicUrl,
            };
            i++;
        });

        // transform content : DeltaStatic to contentJSON : JSON
        const contentJSON = JSON.parse(JSON.stringify(contentDelta));

        /* Create the record in the Database and fetch currentUserId */

        // fetch current user id
        const { userId, error } = await getCurrentUserId();

        if (error) {
            return {
                error: "Echec de l'authentification de l'utilisateur",
            };
        } else {
            // update the record
            const record = await prisma.article.update({
                where: {
                    id: currentArticle.id,
                },
                data: {
                    title: title,
                    content: contentJSON,
                    imagesPath: imagePaths,
                    authorId: userId!,
                    writtenOn: new Date(date),
                },
            });

            if (record != null) {
                // creation is a success
                revalidatePath("/dashboard/articles");
                return { success: true };
            } else {
                // record creation failed
                return {
                    error: "Echec de la modification de l'article dans la base de données... Veuillez contacter un administrateur",
                };
            }
        }
    } else {
        // content is empty
        return {
            error: "Le contenu de l'article ne peut être nul",
        };
    }
}
