import Image from "@/components/image"
import Link from "@/components/link"
import type { Association } from "@/generated/prisma/client"

export default function AssociationCard({
    association
}: {
    association: Association & { logoUrl: string }
}) {
    return (
        <Link
            href={`/a-propos/reseau/associations/${association.id}`}
            className="relative flex flex-col rounded-lg bg-white p-4 outline-1 outline-black transition-all hover:scale-105"
        >
            <Image
                src={association.logoUrl}
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
        </Link>
    )
}
