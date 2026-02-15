import AdhesionList from "@/components/dashboard/adhesions/adhesionList"
import prisma from "@/helpers/db"

export default async function ArchivedAdhesions() {
    const adhesions = await prisma.adhesion.findMany({
        where: {
            archived: {
                not: null
            }
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
                d'adhésion archivée{adhesions.length > 1 ? "s" : ""}.
            </p>
            <AdhesionList adhesions={adhesions} />
        </div>
    )
}
