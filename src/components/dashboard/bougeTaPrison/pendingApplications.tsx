import type { BTPTutorApplication } from "@/generated/prisma/client"

import CandidaturesTable from "./candidaturesTable"

export default function PendingApplications({
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
                en attente.
            </p>
            <CandidaturesTable data={data} />
        </div>
    )
}
