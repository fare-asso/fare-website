import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import { redirect } from "next/navigation";
import AssociationAccountDropdown from "./accountDropdown";

export default async function Header() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();

    if (error) {
        console.log(error.message);
        redirect("/");
    }

    const association = await prisma.association.findUnique({
        where: {
            representativeId: data.user.id,
        },
    });

    if (!association) {
        console.log("Aucune association trouvée associée a ces identifiants");
        redirect("/");
    }

    const logoUrl = supabase.storage
        .from("association-pictures")
        .getPublicUrl(association.logoPath).data.publicUrl;

    return (
        <div className="flex h-12 w-full flex-row items-center justify-between bg-black p-3 text-white">
            <span className="text-xl font-semibold">Espace Asso FAHB</span>
            <AssociationAccountDropdown
                associationName={association.name}
                logoUrl={logoUrl}
            />
        </div>
    );
}
