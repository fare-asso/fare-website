import CommuniquesCard from "@/components/public/presse/cdpCard";
import DossierDePresseCard from "@/components/public/presse/ddpCard";
import prisma from "@/helpers/db";
import Link from "next/link";

export default async function Presse() {
    const communiques = await prisma.communiqueDePresse.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16 mb-20">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">
                Documents de presse
            </h1>

            <div className="w-3/4 flex flex-col items-center space-y-2">
                {communiques.length > 0 ? (
                    communiques.map((cdp) =>
                        cdp.type == "CDP" ? (
                            <CommuniquesCard key={cdp.id} communique={cdp} />
                        ) : (
                            <DossierDePresseCard key={cdp.id} dossier={cdp} />
                        ),
                    )
                ) : (
                    <span className="text-xl">
                        {"Nous n'avons pas encore de documents de presse.🥲"}
                    </span>
                )}
            </div>
        </div>
    );
}
