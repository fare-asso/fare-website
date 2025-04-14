"use client";

import deleteTutorApplication from "@/actions/bouge-ta-prison/deleteTutorApplication";
import LoadingRing from "@/components/dashboard/loadingRing";
import { Button } from "@/components/ui/button";
import { BTPTutorApplication } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { FaCheckCircle, FaQuestionCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function ApplicationCard({
    application,
}: {
    application: BTPTutorApplication;
}) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();

        setIsDeleting(true);
        // Delete the application
        const { success, error } = await deleteTutorApplication(application.id);
        setIsDeleting(false);
    };

    return (
        <div className="flex w-full flex-row items-center justify-between rounded-lg border p-2 shadow-xs md:p-4">
            <div className="flex flex-row items-center gap-2">
                <span className="ml-1 text-base font-semibold capitalize">
                    <Link
                        href={`/dashboard/bouge-ta-prison/candidatures-tutorat/${application.id}`}
                        className="w-full overflow-hidden text-sm text-nowrap text-ellipsis underline transition-all hover:opacity-75"
                    >
                        {(
                            (application.firstName + " " + application.lastName)
                                .length > 20
                        ) ?
                            (
                                application.firstName +
                                " " +
                                application.lastName
                            ).slice(0, 20) + "..."
                        :   application.firstName + " " + application.lastName}
                    </Link>
                </span>

                {application.approved ?
                    <FaCheckCircle
                        size={15}
                        className="inline-block text-green-500"
                    />
                :   <FaQuestionCircle
                        size={15}
                        className="inline-block text-amber-500"
                    />
                }

                <span className="hidden text-sm opacity-75 md:block">
                    {format(application.createdAt, "dd/MM/yyyy")}
                </span>
            </div>

            <div>
                {/* Delete */}
                <Button
                    variant="destructive"
                    className="p-3"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ?
                        <span className="mr-1 hidden md:block">
                            Suppression
                        </span>
                    :   <span className="mr-1 hidden md:block">Supprimer</span>}
                    {isDeleting ?
                        <LoadingRing className="mr-0!" />
                    :   <MdDelete size={20} />}
                </Button>
            </div>
        </div>
    );
}
