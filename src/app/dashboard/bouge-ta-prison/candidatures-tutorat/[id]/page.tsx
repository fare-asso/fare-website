import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import { StorageUtils } from "@/helpers/supabase/storageUtils";
import { format } from "date-fns";
import Link from "next/link";

export default async function TutorApplicationPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;

    const tutorApplication = await prisma.bTPTutorApplication.findUnique({
        where: {
            id: Number(id),
        },
    });

    if (!tutorApplication) {
        return <span>Cette candidature n'existe pas 😔</span>;
    }

    const supabase = createClient();

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
        </div>
    );
}
