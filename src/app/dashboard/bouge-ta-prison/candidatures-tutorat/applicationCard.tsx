import { Button } from "@/components/ui/button";
import { BTPTutorApplication } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { MdDelete } from "react-icons/md";

export default function ApplicationCard({
    application,
}: {
    application: BTPTutorApplication;
}) {
    return (
        <div className="flex w-full flex-row items-center justify-between rounded-lg border p-2 shadow-sm md:p-4">
            <div className="flex flex-row items-center gap-2">
                <span className="ml-1 text-base font-semibold capitalize">
                    <Link
                        href={`/dashboard/bouge-ta-prison/candidatures-tutorat/${application.id}`}
                        className="underline transition-all hover:opacity-75"
                    >
                        {application.firstName} {application.lastName}
                    </Link>
                </span>

                <span className="text-sm opacity-75">
                    {format(application.createdAt, "dd/MM/yyyy")}
                </span>
            </div>

            <div>
                <Button variant="destructive" className="p-3">
                    <span className="mr-1 hidden md:block">Supprimer</span>
                    <MdDelete size={20} />
                </Button>
            </div>
        </div>
    );
}
