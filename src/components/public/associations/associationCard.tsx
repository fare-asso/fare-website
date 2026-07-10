import type { Association } from "@/generated/prisma/client"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export default function AssociationCard({
    association
}: {
    association: Association
}) {
    const logoUrl = new StorageUtils()
        .from("association-pictures")
        .getPublicUrl(association.logoPath)

    return (
        <a
            href={`/a-propos/reseau/associations/${association.id}`}
            className="relative flex flex-col rounded-lg bg-white p-4 outline-1 outline-black transition-all hover:scale-105"
        >
            <img
                src={logoUrl}
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
