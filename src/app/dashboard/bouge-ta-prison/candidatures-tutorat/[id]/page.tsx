import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import { format } from "date-fns";
import Link from "next/link";
import SendApprovalButton from "./sendApprovalButton";
import { FaCheckCircle, FaQuestionCircle } from "react-icons/fa";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default async function TutorApplicationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

    if (isNaN(Number(id))) {
        return <span>Cette candidature n'existe pas 😔</span>;
    }

    const tutorApplication = await prisma.bTPTutorApplication.findUnique({
        where: {
            id: Number(id),
        },
    });

    if (!tutorApplication) {
        return <span>Cette candidature n'existe pas 😔</span>;
    }

    const supabase = await createClient();

    const { data: cvSignedUrlData, error: cvSignedUrlError } =
        await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(tutorApplication.cvPath, 3600);

    const { data: lmSignedUrlData, error: lmSignedUrlError } =
        await supabase.storage
            .from("btp-tutor-application")
            .createSignedUrl(tutorApplication.mlPath, 3600);

    return (
        <div className="h-full w-full p-4">
            <Link
                href="/dashboard/bouge-ta-prison?tab=candidatures"
                className="text-sm underline opacity-80 transition-all hover:font-bold"
            >
                &lsaquo; Retour aux candidatures
            </Link>
            <h1 className="mt-4 text-2xl font-semibold">
                👤Candidature{" "}
                <span className="font-mono opacity-80">
                    #{tutorApplication.id}
                </span>
                <TooltipProvider delayDuration={400}>
                    <Tooltip>
                        <TooltipTrigger>
                            {tutorApplication.approved ?
                                <FaCheckCircle
                                    size={18}
                                    className="ml-2 inline-block text-green-500"
                                />
                            :   <FaQuestionCircle
                                    size={20}
                                    className="ml-2 inline-block text-amber-500"
                                />
                            }
                        </TooltipTrigger>
                        <TooltipContent>
                            {tutorApplication.approved ?
                                "Cette candidature a été approuvée"
                            :   "Cette candidature est en attente d'approbation"
                            }
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </h1>
            <span className="text-sm">
                Soumise le{" "}
                <span className="font-bold">
                    {format(tutorApplication.createdAt, "dd/MM/yy")}
                </span>
                <span> à </span>
                <span className="font-bold">
                    {format(tutorApplication.createdAt, "HH:mm")}
                </span>
            </span>

            {/* Divide space in two (large screen) */}
            <div className="m-0 flex w-full flex-col md:flex-row">
                {/* Left Part (Top mobile) */}
                <div className="flex h-full w-full flex-col p-4">
                    <span>
                        Nom: <b>{tutorApplication.lastName}</b>
                    </span>
                    <span>
                        Prénom: <b>{tutorApplication.firstName}</b>
                    </span>
                    <span>
                        📧Email:{" "}
                        <a
                            href={`mailto:${tutorApplication.email}`}
                            className="underline transition-all hover:font-semibold"
                        >
                            {tutorApplication.email}
                        </a>
                    </span>
                    <span>
                        🧪Filière: <b>{tutorApplication.major}</b>
                    </span>
                    <span>
                        📅Année d'études: <b>{tutorApplication.studyYear}</b>
                    </span>
                </div>

                {/* Right Part (Bottom mobile) */}
                <div className="h-full w-full p-4">
                    <h2 className="text-xl font-bold">
                        📂Fichiers complémentaires:
                    </h2>
                    <ul className="ml-4 list-disc space-y-2">
                        <li>
                            {cvSignedUrlError ?
                                <span>Impossible de récupérer le CV</span>
                            :   <a
                                    href={cvSignedUrlData.signedUrl}
                                    target="_blank"
                                    className="underline transition-all hover:font-semibold"
                                >
                                    📄CV
                                </a>
                            }
                        </li>
                        <li>
                            {lmSignedUrlError ?
                                <span>
                                    Impossible de récupérer la lettre de
                                    motivation
                                </span>
                            :   <a
                                    href={lmSignedUrlData.signedUrl}
                                    target="_blank"
                                    className="underline transition-all hover:font-semibold"
                                >
                                    📝Lettre de motivation
                                </a>
                            }
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Part */}
            <div className="flex w-full flex-col items-center md:ml-8 md:mt-8 md:items-start">
                {!tutorApplication.approved && (
                    <SendApprovalButton application={tutorApplication} />
                )}
            </div>
        </div>
    );
}
