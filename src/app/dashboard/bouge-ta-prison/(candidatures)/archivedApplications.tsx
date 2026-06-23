import prisma from "@/helpers/db"

import CandidaturesTable from "./candidaturesTable"

export default async function ArchivedApplications() {
    const applications = await prisma.bTPTutorApplication.findMany({
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
        <div className="flex min-h-0 w-full flex-1 flex-col">
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {applications.length} candidature
                    {applications.length > 1 ? "s" : ""}
                </span>{" "}
                archivée{applications.length > 1 ? "s" : ""}.
            </p>
            <CandidaturesTable data={applications} />
        </div>
    )
}
