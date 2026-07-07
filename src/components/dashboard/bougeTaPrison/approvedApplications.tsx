import type { BTPTutorApplication } from "@/generated/prisma/client"

import CandidaturesTable from "./candidaturesTable"

export default function ApprovedApplications({
    applications
}: {
    applications: BTPTutorApplication[]
}) {
    return (
        <div className="flex min-h-0 w-full flex-1 flex-col">
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {applications.length} candidature
                    {applications.length > 1 ? "s" : ""}
                </span>{" "}
                approuvée{applications.length > 1 ? "s" : ""}.
            </p>
            <CandidaturesTable data={applications} />
        </div>
    )
}
