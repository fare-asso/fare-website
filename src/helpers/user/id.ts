
import { createClient } from "../supabase/server";

export default async function getCurrentUserId() : Promise<{userId?: string, error?: string}> {

    // create supabase client
    const supabase = createClient();

    // fetch current user
    const { data : {user}, error } = await supabase.auth.getUser();

    if(user) {

        return {
            userId: user.id
        }

    } else { // User Session is not valid
        console.log(error?.message)
        return {
            error: "L'utilisateur n'est pas authentifié"
        }
    }


}