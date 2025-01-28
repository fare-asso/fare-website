import CreatePasswordForm from "@/components/espaceAsso/createPasswordForm";
import { createClient } from "@/helpers/supabase/server";
import { redirect } from "next/navigation";

export default async function CreatePasswordPage() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        return (
            <div>
                {"Echec de l'authentification de votre compte représentant"}
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center p-0 sm:p-1 md:p-4 lg:p-8">
            <CreatePasswordForm email={data.user.email!} />
        </div>
    );
}
