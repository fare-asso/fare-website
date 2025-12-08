import prisma from "@/helpers/db"
import ApplicationCard from "./applicationCard"

export default async function ApplicationList() {
    const applications = await prisma.bTPTutorApplication.findMany({
        orderBy: {
            createdAt: "desc"
        }
    })
    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto rounded-lg border p-4 shadow-xs">
                <div className="flex h-auto flex-col gap-2">
                    {applications.length > 0 ? (
                        applications.map((application) => (
                            <ApplicationCard
                                application={application}
                                key={application.id}
                            />
                        ))
                    ) : (
                        <span className="text-sm opacity-50">
                            Il n'y a pas encore de candidatures.😔
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
