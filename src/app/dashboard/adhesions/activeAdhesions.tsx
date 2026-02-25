import AdhesionList from "@/components/dashboard/adhesions/adhesionList"
import prisma from "@/helpers/db"

interface ActiveAdhesionsProps {
    canEdit: boolean
    canDownload: boolean
}

export default async function ActiveAdhesions({
    canEdit,
    canDownload
}: ActiveAdhesionsProps) {
    const adhesions = await prisma.adhesion.findMany({
        where: {
            archived: null
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div>
            <p className="my-4 text-gray-500 text-sm">
                <span className="font-bold">
                    {adhesions.length} demande{adhesions.length > 1 ? "s" : ""}
                </span>{" "}
                d'adhésion en attente de traitement.
            </p>
            <AdhesionList
                adhesions={adhesions}
                canEdit={canEdit}
                canDownload={canDownload}
            />
        </div>
    )
}
