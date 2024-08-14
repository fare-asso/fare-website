import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import Image from "next/image";
import { redirect } from "next/navigation";
import AssociationAccountDropdown from "./accountDropdown";

export default async function Header() {

    const supabase = createClient();

    const { data, error } = await supabase.auth.getUser();

    if(error) {
        console.log(error.message)
        redirect('/')
    }

    const association = await prisma.association.findUnique({
        where: {
            representativeId: data.user.id,
        }
    })

    if(!association) {
        console.log("Aucune association trouvée associée a ces identifiants")
        redirect('/');
    }

    const logoUrl = supabase.storage.from('association-pictures').getPublicUrl(association.logoPath[0]).data.publicUrl;

    return (
        <div className="w-full h-12 flex flex-row items-center justify-between bg-black text-white p-3">
            <span className="font-semibold text-xl">Espace Asso FAHB</span>
            <AssociationAccountDropdown associationName={association.name} logoUrl={logoUrl} />
        </div>
    )
}