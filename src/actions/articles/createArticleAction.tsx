"use server";

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";
import getCurrentUserId from "@/helpers/user/id";
import { revalidatePath } from "next/cache";
import getCurrentUserRole from "@/helpers/user/role";
import { JSONContent } from "@tiptap/react";

export default async function createArticleAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole();
    if (error) return { error: "Echec de l'authentification de l'utilisateur" };
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération.",
        };

    // create supabase client
    const supabase = await createClient();

    // retrieve form data fields
    const title = formData.get("title")?.toString();
    const content = formData.get("content")?.toString();

    // Fields Validation
    if (!title || !content) {
        return { error: "Veuillez remplir tous les champs obligatoires." };
    }

    // Images
    const images = formData.getAll("images") as File[];
    images.forEach((image) => {
        console.log(image);
    });

    // upload images to storage
    const responses = await Promise.all(
        images.map(
            async (file) =>
                await supabase.storage
                    .from("article-pictures")
                    .upload(file.name, file),
        ),
    );

    // check for errors
    responses.forEach((response) => {
        if (response.error) {
            return {
                error: "L'upload des images a échoué. Veuillez réessayer",
            };
        }
    });

    const contentDelta: JSONContent = JSON.parse(content);

    const { userId, error: userIdError } = await getCurrentUserId();

    if (userIdError) {
        // Delete uploaded images
        await Promise.all(
            responses.map(async (response) => {
                await supabase.storage
                    .from("article-pictures")
                    .remove([response.data?.path!]);
            }),
        );

        return {
            error: "Echec de l'authentification de l'utilisateur",
        };
    }

    // insert article to database
    const record = await prisma.article.create({
        data: {
            title: title,
            content: contentDelta,
            imagesPath: responses.map((response) => response.data?.path!),
            authorId: userId!,
        },
    });

    revalidatePath("/actualites");
    revalidatePath("/dashboard/articles");

    return { success: true };
    // if (contentDelta.ops && contentDelta.ops.length > 0) {
    //     // content is not null

    //     /* Filter all operations that contains images */

    //     const opsLength: number = contentDelta.ops.length;
    //     const b64Images: Map<number, string> = new Map<number, string>(); // number is operation index and string is the base64 image

    //     for (let i = 0; i < opsLength; i++) {
    //         // iterate throught all operations
    //         const currentOp = contentDelta.ops[i].insert;
    //         if (currentOp.image) {
    //             // current operation is an image
    //             b64Images.set(i, currentOp.image);
    //         }
    //     }

    //     /* Convert those images to File type */

    //     const imageFiles: File[] = [];
    //     b64Images.forEach((image, index) => {
    //         imageFiles.push(base64ToFile(image, "image" + index));
    //     });

    //     /* Upload those images on the storage and save to path */

    //     const imagePaths: string[] = [];

    //     const responses: UploadResponse[] = await Promise.all(
    //         imageFiles.map(
    //             async (file) =>
    //                 await supabase.storage
    //                     .from("article-pictures")
    //                     .upload(randomUUID() + file.name, file),
    //         ),
    //     );

    //     responses.forEach((value) => {
    //         if (value.error) {
    //             return {
    //                 error: "L'upload des images a échoué. Veuillez réessayer",
    //             };
    //         } else {
    //             imagePaths.push(value.data.path);
    //         }
    //     });

    //     /* Replace base64 in the Delta with url  */

    //     let i = 0;
    //     b64Images.forEach((value, index) => {
    //         contentDelta.ops![index].insert = {
    //             image: supabase.storage
    //                 .from("article-pictures")
    //                 .getPublicUrl(imagePaths[i]).data.publicUrl,
    //         };
    //         i++;
    //     });

    //     // transform content : DeltaStatic to contentJSON : JSON
    //     const contentJSON = JSON.parse(JSON.stringify(contentDelta));

    //     /* Create the record in the Database and fetch currentUserId */

    //     // fetch current user id
    //     const { userId, error } = await getCurrentUserId();

    //     if (error) {
    //         return {
    //             error: "Echec de l'authentification de l'utilisateur",
    //         };
    //     } else {
    //         // create the record
    //         const record = await prisma.article.create({
    //             data: {
    //                 title: title,
    //                 content: contentJSON,
    //                 imagesPath: imagePaths,
    //                 authorId: userId!,
    //             },
    //         });

    //         if (record != null) {
    //             // creation is a success
    //             revalidatePath("/actualites");
    //             revalidatePath("/dashboard/articles");
    //             return { success: true };
    //         } else {
    //             // record creation failed
    //             return {
    //                 error: "Echec de la création de l'article dans la base de données... Veuillez contacter un administrateur",
    //             };
    //         }
    //     }
    // } else {
    //     // content is empty
    //     return {
    //         error: "Le contenu de l'article ne peut être nul",
    //     };
    // }
}
