import prisma from "@/helpers/db"
import ApplicationCard from "./candidatures-tutorat/applicationCard"

export default async function PendingApplications() {
    const applications = await prisma.bTPTutorApplication.findMany({
        where: {
            archived: null,
            approved: false
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    return (
        <div className="@container flex h-full flex-col">
            <p className="my-4 text-gray-500 text-sm">
                <span className="font-bold">
                    {applications.length} candidature
                    {applications.length > 1 ? "s" : ""}
                </span>{" "}
                en attente.
            </p>
            <div className="flex-1 overflow-y-auto">
                {applications.length > 0 ? (
                    <div className="grid @min-2xl:grid-cols-2 grid-cols-1 gap-3">
                        {applications.map((application) => (
                            <ApplicationCard
                                application={application}
                                key={application.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                        <p className="font-medium text-muted-foreground">
                            Aucune candidature en attente
                        </p>
                        <p className="mt-1 text-muted-foreground/70 text-sm">
                            Les nouvelles candidatures apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
