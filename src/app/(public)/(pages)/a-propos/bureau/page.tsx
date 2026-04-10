import type { Metadata } from "next"
import MemberList from "@/components/public/bureau/memberList"
import prisma from "@/helpers/db"

export const metadata: Metadata = {
    title: "Le Bureau",
    description: "Page des membres du bureau de la FARE"
}

export default async function Bureau() {
    const bureau = await prisma.member.findMany({
        orderBy: [{ order: "asc" }, { id: "asc" }]
    })

    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-[10vw] font-semibold text-[3rem]">Le Bureau</h1>
            <MemberList members={bureau} />
        </div>
    )
}
