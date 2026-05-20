import type { Metadata } from "next"
import Image from "next/image"

import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { tryCatch } from "@/lib/utils"

export const metadata: Metadata = {
    title: "Nos partenaires",
    description: "Les partenaires de la FARE"
}

export default async function Partenaires() {
    const supabase = await createClient()
    const partenaires = await tryCatch(
        prisma.partenaire.findMany({
            orderBy: { name: "asc" }
        })
    )

    if (partenaires.value === null) {
        return { success: false, error: "Partenaires introuvable" }
    }

    const partners = partenaires.value.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        logoUrl: supabase.storage
            .from("partner-pictures")
            .getPublicUrl(p.logoPath).data.publicUrl
    }))

    return (
        <div className="flex w-full flex-col items-center justify-start pb-20">
            <h1 className="py-12 text-[3rem] font-semibold sm:py-24 md:py-32 lg:py-44">
                Nos Partenaires
            </h1>
            {partners.length === 0 ? (
                <p className="px-4 text-center text-lg">
                    Aucun partenaire pour le moment.
                </p>
            ) : (
                <div className="flex w-full max-w-5xl flex-col px-4">
                    {partners.map((partner, index) => {
                        const isEven = index % 2 === 0
                        return (
                            <div key={partner.id}>
                                {index !== 0 && (
                                    <div className="my-16 h-px w-full bg-linear-to-r from-transparent via-gray-300 to-transparent" />
                                )}
                                <div
                                    className={`flex flex-col items-center gap-8 md:flex-row ${
                                        isEven ? "" : "md:flex-row-reverse"
                                    }`}
                                >
                                    <div className="w-full shrink-0 md:w-1/2">
                                        <Image
                                            src={partner.logoUrl}
                                            alt={`Logo de ${partner.name}`}
                                            width={500}
                                            height={500}
                                            className="h-auto max-h-64 w-full object-contain"
                                        />
                                    </div>
                                    <div className="w-full md:w-1/2">
                                        <h2 className="mb-4 text-3xl">
                                            {partner.name}
                                        </h2>
                                        <p className="text-justify">
                                            {partner.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
