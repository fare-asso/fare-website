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
        <div className="flex h-min w-full flex-col items-start rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
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
                    width={1000}
                    height={1000}
                    alt={"Logo de l'association " + association.name}
                    className="mb-1 aspect-square rounded-md object-cover shadow-sm"
                />
            </div>

            <div className="flex w-full flex-row space-x-1 overflow-hidden text-ellipsis text-nowrap font-medium text-card-foreground">
                {association.name}
            </div>
            <div className="text-sm text-foreground/70">
                {association.major}
            </div>
        </div>
    );
}
