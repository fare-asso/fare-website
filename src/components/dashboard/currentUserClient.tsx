"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/helpers/supabase/client"

export default function CurrentUserClient() {
    const [email, setEmail] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        async function fetchUser() {
            const { data, error } = await supabase.auth.getUser()
            if (error) {
                console.error(
                    "Erreur lors de la récupération de l'utilisateur :",
                    error
                )
            } else {
                setEmail(data.user.email || null)
            }
        }
        void fetchUser()
    }, [supabase])

    return (
        <div className="hidden items-center text-black text-sm lg:flex lg:flex-col">
            Connecté en tant que
            <div className="font-semibold">{email}</div>
        </div>
    )
}
