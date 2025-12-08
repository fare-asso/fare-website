"use client"

import type { BTPTutorQuestion } from "@prisma/client"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { MdDelete } from "react-icons/md"
import deleteTutorQuestion from "@/actions/bouge-ta-prison/deleteTutorQuestion"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"

export default function QuestionCard({
    question
}: {
    question: BTPTutorQuestion
}) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        setIsDeleting(true)
        // Delete the question
        const { success, error } = await deleteTutorQuestion(question.id)
        setIsDeleting(false)
    }

    return (
        <div className="flex w-full flex-row items-center justify-between rounded-lg border p-2 shadow-xs md:p-4">
            <div className="flex flex-row items-center gap-2">
                <span className="ml-1 font-semibold text-base capitalize">
                    <Link
                        href={`/dashboard/bouge-ta-prison/questions/${question.id}`}
                        className="w-full overflow-hidden text-ellipsis text-nowrap underline transition-all hover:opacity-75"
                    >
                        {`${question.firstName} ${question.lastName}`.length >
                        20
                            ? `${(
                                  question.firstName + " " + question.lastName
                              ).slice(0, 20)}...`
                            : `${question.firstName} ${question.lastName}`}
                    </Link>
                </span>

                <span className="hidden text-sm opacity-75 md:block">
                    {format(question.createdAt, "dd/MM/yyyy")}
                </span>
            </div>

            <div>
                <Button
                    variant="destructive"
                    className="p-3"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <span className="mr-1 hidden md:block">
                            Suppression
                        </span>
                    ) : (
                        <span className="mr-1 hidden md:block">Supprimer</span>
                    )}
                    {isDeleting ? (
                        <LoadingRing className="mr-0!" />
                    ) : (
                        <MdDelete size={20} />
                    )}
                </Button>
            </div>
        </div>
    )
}
