import prisma from "@/helpers/db";
import { format } from "date-fns";
import Link from "next/link";

export default async function TutorApplicationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

    const tutorQuestion = await prisma.bTPTutorQuestion.findUnique({
        where: {
            id: Number(id),
        },
    });

    if (!tutorQuestion) {
        return <span>Cette question n'existe pas ou plus... 😔</span>;
    }

    return (
        <div className="h-full w-full p-4">
            <Link
                href="/dashboard/bouge-ta-prison?tab=questions"
                className="text-sm underline opacity-80 transition-all hover:font-bold"
            >
                &lsaquo; Retour aux questions
            </Link>
            <h1 className="mt-4 text-2xl font-semibold">
                ❓Question{" "}
                <span className="font-mono opacity-80">
                    #{tutorQuestion.id}
                </span>
            </h1>
            <span className="text-sm">
                Soumise le{" "}
                <span className="font-bold">
                    {format(tutorQuestion.createdAt, "dd/MM/yy")}
                </span>
                <span> à </span>
                <span className="font-bold">
                    {format(tutorQuestion.createdAt, "HH:mm")}
                </span>
            </span>

            {/* Divide space in two (large screen) */}
            <div className="m-0 flex w-full flex-col md:flex-row">
                {/* Left Part (Top mobile) */}
                <div className="flex h-full w-full flex-col p-4">
                    <span>
                        Nom: <b>{tutorQuestion.lastName}</b>
                    </span>
                    <span>
                        Prénom: <b>{tutorQuestion.firstName}</b>
                    </span>
                    <span>
                        📧Email:{" "}
                        <a
                            href={`mailto:${tutorQuestion.email}`}
                            className="underline transition-all hover:font-semibold"
                        >
                            {tutorQuestion.email}
                        </a>
                    </span>
                    <span>
                        🧪Filière: <b>{tutorQuestion.major}</b>
                    </span>
                    <span>
                        📅Année d'études: <b>{tutorQuestion.studyYear}</b>
                    </span>
                </div>

                {/* Right Part (Bottom mobile) */}
                <div className="h-full w-full p-4">
                    <h2 className="text-xl font-bold">📝Message:</h2>
                    <div>
                        <p className="whitespace-break-spaces text-justify">
                            {tutorQuestion.question}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
