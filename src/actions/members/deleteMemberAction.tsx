'use server';

import prisma from "@/helpers/db";

import { createClient } from "@/helpers/supabase/server";
import { revalidatePath } from "next/cache";

export default async function deleteMemberAction({id} : {id: number}) {

    // create supabase client
    const supabase = createClient();

    const res = await prisma.member.delete({
        where: {
            id : id
        }
    })


    if(res != null) { // successfully deleted

        const { data, error } = await supabase.storage.from('member-pictures').remove([res.picturePath]);
        if(error) {
            return {
                error: error.message
            }
        } else {
            revalidatePath('/dashboard/membres')
            return {
                success : true
            }
        }
        
    } else {
        return {
            error : "Failed to delete record"
        }
    }

}