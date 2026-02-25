"use client"

import type { Association } from "@prisma/client"
import Image from "next/image"
import DeleteAssociationButton from "./deleteAssociationButton"
import DeleteRepresentativeButton from "./deleteRepresentativeButton"
import EditAssociationButton from "./editAssociationButton"
import SendInvitationLinkButton from "./sendInvitationLinkButton"

interface AssociationCardProps {
    association: Association
    logoUrl: string
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
}

export default function AssociationCard({
    association,
    logoUrl,
    canEdit,
    canDelete,
    canInvite
}: AssociationCardProps) {
    return (
        <div className="flex h-full w-full flex-col items-start rounded-lg border bg-card p-3 text-card-foreground shadow-xs">
            <div className="relative">
                {/* Hover buttons */}
                {canDelete || canEdit || canInvite ? (
                    <div className="absolute flex h-full w-full flex-row items-start justify-end space-x-1 p-2 opacity-100 lg:opacity-0 lg:hover:opacity-100">
                        {canDelete ? (
                            <DeleteAssociationButton
                                association={association}
                            />
                        ) : null}
                        {canEdit ? (
                            <EditAssociationButton association={association} />
                        ) : null}
                        {canInvite ? (
                            association.representativeId ? (
                                <DeleteRepresentativeButton
                                    association={association}
                                />
                            ) : (
                                <SendInvitationLinkButton
                                    association={association}
                                />
                            )
                        ) : null}
                    </div>
                ) : null}
                <Image
                    src={logoUrl}
                    width={500}
                    height={500}
                    alt={`Logo de l'association ${association.name}`}
                    className="mb-1 aspect-square rounded-md object-cover shadow-xs"
                />
            </div>

            <div className="flex w-full flex-row space-x-1 overflow-hidden text-ellipsis text-nowrap font-medium text-card-foreground">
                {association.name}
            </div>
            <div className="text-foreground/70 text-sm">
                {association.major}
            </div>
        </div>
    )
}
