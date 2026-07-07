import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import Image from "@/components/image"
import Link from "@/components/link"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import { tryCatch } from "@/lib/utils"

const getAssociation = createServerFn()
    .inputValidator((id: number) => id)
    .handler(async ({ data }) => {
        const supabase = createClient()
        const result = await tryCatch(
            prisma.association.findUnique({
                where: { id: data, approved: { not: null } }
            })
        )
        if (!result.success || !result.value) return null
        return {
            name: result.value.name,
            desc: result.value.desc,
            logoUrl: supabase.storage
                .from("association-pictures")
                .getPublicUrl(result.value.logoPath).data.publicUrl
        }
    })

export const Route = createFileRoute(
    "/_public/a-propos/reseau/associations/$id"
)({
    loader: async ({ params }) => {
        if (Number.isNaN(Number(params.id))) {
            return { association: null, invalidId: true }
        }
        return {
            association: await getAssociation({ data: Number(params.id) }),
            invalidId: false
        }
    },
    head: ({ loaderData }) => {
        if (loaderData?.invalidId) {
            return {
                meta: [
                    { title: "Association" },
                    { name: "description", content: "Page d'association" }
                ]
            }
        }
        if (!loaderData?.association) {
            return {
                meta: [
                    { title: "Association Inconnue" },
                    {
                        name: "description",
                        content:
                            "Nous n'avons pas pu trouver l'association que vous recherchez..."
                    }
                ]
            }
        }
        return {
            meta: [
                { title: `FARE - ${loaderData.association.name}` },
                {
                    name: "description",
                    content: loaderData.association.desc
                }
            ]
        }
    },
    component: AssociationPage
})

function AssociationPage() {
    const { association, invalidId } = Route.useLoaderData()

    if (invalidId) {
        return (
            <div>
                <span>L'association recherchée n'existe pas</span>
            </div>
        )
    }

    if (!association) {
        return (
            <div>
                <span>L'association recherchée n'existe pas ou plus</span>
            </div>
        )
    }

    return (
        <div className="flex w-[90%] flex-col items-start pt-14">
            <Link
                href="/a-propos/reseau"
                className="text-sm opacity-40 hover:underline"
            >
                &lt; Retour aux associations
            </Link>
            <h1 className="mt-2 text-3xl font-bold">{association.name}</h1>
            <div className="flex w-full flex-row">
                <p>{association.desc}</p>
                <Image
                    src={association.logoUrl}
                    width={400}
                    height={400}
                    alt={`${association.name} logo`}
                    className="aspect-square h-60 w-60 rounded-lg border border-black object-cover"
                />
            </div>
        </div>
    )
}
