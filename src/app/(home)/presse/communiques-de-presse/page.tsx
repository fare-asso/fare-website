import Link from "next/link"
import CommuniquesCard from "@/components/public/presse/cdpCard"
import prisma from "@/helpers/db"

export default async function CommuniquesDePresse() {
    const communiques = await prisma.communiqueDePresse.findMany({
        where: {
            type: "CDP"
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center font-bold text-4xl sm:py-24">
                Communiqués de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {communiques.length > 0 ? (
                    communiques.map((cdp) => (
                        <CommuniquesCard key={cdp.id} communique={cdp} />
                    ))
                ) : (
                    <span className="text-xl">
                        {"Nous n'avons pas encore de communiqués de presse.🥲"}
                    </span>
                )}
            </div>
        </div>
    )
}
