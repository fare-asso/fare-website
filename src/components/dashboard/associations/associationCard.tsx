"use client";

import Image from "next/image";

import { Association } from "@prisma/client";
import EditAssociationButton from "./editAssociationButton";
import SendInvitationLinkButton from "./sendInvitationLinkButton";
import DeleteRepresentativeButton from "./deleteRepresentativeButton";
import DeleteAssociationButton from "./deleteAssociationButton";

export default function AssociationCard({
    association,
    logoUrl,
}: {
    association: Association;
    logoUrl: string;
}) {
    return (
        <div className="bg-card text-card-foreground flex h-full w-full flex-col items-start rounded-lg border p-3 shadow-xs">
            <div className="relative">
                {/* Hover buttons */}
                <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-2 opacity-100 lg:opacity-0 lg:hover:opacity-100">
                    <DeleteAssociationButton association={association} />
                    <EditAssociationButton association={association} />
                    {association.representativeId ?
                        <DeleteRepresentativeButton association={association} />
                    :   <SendInvitationLinkButton association={association} />}
                </div>
                <Image
                    src={logoUrl}
                    width={500}
                    height={500}
                    alt={"Logo de l'association " + association.name}
                    className="mb-1 aspect-square rounded-md object-cover shadow-xs"
                />
            </div>

            <div className="text-card-foreground flex w-full flex-row space-x-1 overflow-hidden font-medium text-nowrap text-ellipsis">
                {association.name}
            </div>
            <div className="text-foreground/70 text-sm">
                {association.major}
            </div>
        </div>
    );
}
