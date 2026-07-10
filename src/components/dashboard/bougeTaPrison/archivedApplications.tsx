import type { BTPTutorApplication } from "@/generated/prisma/client"

import CandidaturesTable from "./candidaturesTable"

export default function ArchivedApplications({
    data
}: {
    data: BTPTutorApplication[]
}) {
    return (
        <div className="flex min-h-0 w-full flex-1 flex-col">
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {data.length} candidature
                    {data.length > 1 ? "s" : ""}
                </span>{" "}
                archivée{data.length > 1 ? "s" : ""}.
            </p>
            <CandidaturesTable data={data} archived />
        </div>
    )
}
