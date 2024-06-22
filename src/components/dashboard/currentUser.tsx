import { createClient } from "@/helpers/supabase/server"

export default async function CurrentUser() {

    const supabase = createClient();

    const { error, data } = await supabase.auth.getUser();

    if(error) {
        console.error("Echec de l'authentification de l'utilisateur")
        return(<>Echec</>)
    } else {

        const email : string = data.user.email!;
        return(
            <div className="text-sm text-black lg:flex lg:flex-col items-center hidden">Connecté en tant que 
                <div className="font-semibold">{email}</div>
            </div>
        )
    }

    
}