import Image from "next/image"

import type { Association } from "@/generated/prisma/client"
import { createClient } from "@/helpers/supabase/server"

export default async function AssociationCard({
    association
}: {
    association: Association
}) {
    const supabase = await createClient()

    return (
        <a
            href={`/a-propos/reseau/associations/${association.id}`}
            className="relative flex flex-col rounded-lg bg-white p-4 outline-1 outline-black transition-all hover:scale-105"
        >
            <Image
                src={
                    supabase.storage
                        .from("association-pictures")
                        .getPublicUrl(association.logoPath).data.publicUrl
                }
                width={400}
                height={400}
                alt={`${association.name} logo`}
                className="aspect-square w-full rounded-lg border border-black object-cover"
            />
            <div className="flex w-full flex-row">
                <div className="mt-2 flex flex-col">
                    <span className="text-xl font-semibold">
                        {association.name}
                    </span>
                    <span className="rounded-full border border-black px-4 py-0.5 text-center text-xs font-semibold">
                        {association.major}
                    </span>
                </div>
            </div>
        </a>
    )
}
