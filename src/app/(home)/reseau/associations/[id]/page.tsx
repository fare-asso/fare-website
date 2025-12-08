import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const { id } = await params

    if (Number.isNaN(Number(id)))
        return {
            title: "Association",
            description: "Page d'association"
        }

    const associationMetadata = await prisma.association.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!associationMetadata) {
        return {
            title: "Association Inconnue",
            description:
                "Nous n'avons pas pu trouver l'association que vous recherchez..."
        }
    }

    return {
        title: `FARE - ${associationMetadata.name}`,
        description: associationMetadata.desc
    }
}

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const supabase = await createClient()
    const { id } = await params

    // check if the parameter is correct
    if (Number.isNaN(Number(id))) {
        return (
            <div>
                <span>{"L'association recherchée n'existe pas"}</span>
            </div>
        )
    }

    const associationRecord = await prisma.association.findUnique({
        where: {
            id: Number(id)
        }
    })

    if (!associationRecord) {
        return (
            <div>
                <span>{"L'association recherchée n'existe pas ou plus"}</span>
            </div>
        )
    }

    return (
        <div className="flex w-[90%] flex-col items-start pt-14">
            <Link href="/reseau" className="text-sm opacity-40 hover:underline">
                &lt; Retour aux associations
            </Link>
            <h1 className="mt-2 font-bold text-3xl">
                {associationRecord.name}
            </h1>
            <div className="flex w-full flex-row">
                <p>{associationRecord.desc}</p>
                <Image
                    src={
                        supabase.storage
                            .from("association-pictures")
                            .getPublicUrl(associationRecord.logoPath).data
                            .publicUrl
                    }
                    width={400}
                    height={400}
                    alt={`${associationRecord.name} logo`}
                    className="aspect-square h-60 w-60 rounded-lg border border-black object-cover"
                />
            </div>
        </div>
    )
}
