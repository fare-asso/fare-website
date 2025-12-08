import DossierDePresseCard from "@/components/public/presse/ddpCard"
import prisma from "@/helpers/db"

export default async function DossiersDePresse() {
    const dossiers = await prisma.communiqueDePresse.findMany({
        where: {
            type: "DDP"
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="mb-20 flex w-full flex-col items-center justify-start px-4 md:px-8 lg:px-16">
            <h1 className="py-12 text-center font-bold text-4xl sm:py-24">
                Dossiers de presse
            </h1>

            <div className="flex w-3/4 flex-col items-center space-y-2">
                {dossiers.length > 0 ? (
                    dossiers.map((dossier) => (
                        <DossierDePresseCard
                            key={dossier.id}
                            dossier={dossier}
                        />
                    ))
                ) : (
                    <span className="text-xl">
                        {"Nous n'avons pas encore de dossiers de presse.🥲"}
                    </span>
                )}
            </div>
        </div>
    )
}
