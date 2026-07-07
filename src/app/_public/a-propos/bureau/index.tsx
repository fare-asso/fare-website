import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import MemberList from "@/components/public/bureau/memberList"
import prisma from "@/helpers/db"
import { pageTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getBureau = createServerFn().handler(async () => {
    const result = await tryCatch(
        prisma.member.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] })
    )
    return result.success ? result.value : null
})

export const Route = createFileRoute("/_public/a-propos/bureau/")({
    loader: async () => ({ bureau: await getBureau() }),
    head: () => ({
        meta: [
            { title: pageTitle("Le Bureau") },
            {
                name: "description",
                content: "Page des membres du bureau de la FARE"
            }
        ]
    }),
    component: Bureau
})

function Bureau() {
    const { bureau } = Route.useLoaderData()

    if (!bureau) {
        return (
            <div className="flex w-full flex-col items-center justify-center py-32">
                <p className="text-destructive text-lg font-medium">
                    Echec du chargement des membres du bureau
                </p>
            </div>
        )
    }

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-[10vw] text-[3rem] font-semibold">Le Bureau</h1>
            <MemberList members={bureau} />
        </div>
    )
}
