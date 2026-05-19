"use client"

import type { Association } from "@prisma/client"
import {
    ClockIcon,
    GraduationCapIcon,
    MailIcon,
    MapPinIcon
} from "lucide-react"
import Image from "next/image"

import { Badge } from "@/components/ui/badge"

import ApproveAssociationButton from "./approveAssociationButton"
import DeclineAssociationButton from "./declineAssociationButton"
import DeleteAssociationButton from "./deleteAssociationButton"
import DeleteRepresentativeButton from "./deleteRepresentativeButton"
import EditAssociationButton from "./editAssociationButton"
import SendInvitationLinkButton from "./sendInvitationLinkButton"

/**
 * Parse a location string that may be either a plain string
 * or a JSON object with `displayName` and `coordinates`.
 * Returns a short display label and the full address.
 */
function parseLocation(raw: string): {
    short: string
    full: string
} {
    try {
        const parsed: unknown = JSON.parse(raw)
        if (
            typeof parsed === "object" &&
            parsed !== null &&
            "displayName" in parsed &&
            typeof (parsed as { displayName: unknown }).displayName === "string"
        ) {
            const full = (parsed as { displayName: string }).displayName
            // The displayName is a long comma-separated geocoder
            // string. Take the first two meaningful segments
            // for a compact label.
            const parts = full.split(",").map((s) => s.trim())
            const short = parts.length > 3 ? `${parts[0]}, ${parts[1]}` : full
            return { short, full }
        }
    } catch {
        // Not JSON — treat as plain string
    }
    return { short: raw, full: raw }
}

interface AssociationCardProps {
    association: Association
    logoUrl: string
    hasRepresentative: boolean
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canApprove: boolean
}

export default function AssociationCard({
    association,
    logoUrl,
    canEdit,
    canDelete,
    canInvite,
    canApprove
}: AssociationCardProps): React.JSX.Element {
    const location = association.location
        ? parseLocation(association.location)
        : null
    const isPending = association.approved === null

    return (
        <div
            className={`group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md ${isPending ? "border-amber-300 dark:border-amber-700" : ""}`}
        >
            {/* Logo area */}
            <div className="bg-muted/50 group-hover:bg-muted relative flex items-center justify-center rounded-t-lg transition-colors">
                <Image
                    src={logoUrl}
                    width={220}
                    height={220}
                    alt={`Logo de ${association.name}`}
                    className="aspect-square w-full rounded-md object-contain"
                />
                {isPending ? (
                    <Badge
                        variant="outline"
                        className="absolute top-2 right-2 border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    >
                        <ClockIcon className="mr-1 h-3 w-3" />
                        En attente
                    </Badge>
                ) : null}
            </div>

            {/* Content area */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                {/* Name with tooltip */}
                <h3 className="line-clamp-1 text-sm leading-tight font-medium">
                    {association.name}
                </h3>

                {/* Metadata badges */}
                <div className="flex flex-wrap items-center gap-1.5">
                    <Badge
                        variant="secondary"
                        className="max-w-full truncate text-[10px]"
                    >
                        <GraduationCapIcon className="mr-1 h-3 w-3 shrink-0" />
                        <span className="truncate">{association.major}</span>
                    </Badge>
                    {/*<Tooltip>
                        <TooltipTrigger asChild>
                            <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                    hasRepresentative
                                        ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
                                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                                }`}
                            >
                                {hasRepresentative ? (
                                    <UserCheckIcon className="mr-1 h-3 w-3" />
                                ) : (
                                    <UserXIcon className="mr-1 h-3 w-3" />
                                )}
                                {hasRepresentative
                                    ? "Representant"
                                    : "Sans representant"}
                            </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                            {hasRepresentative
                                ? "Un representant est associe"
                                : "Aucun representant associe"}
                        </TooltipContent>
                    </Tooltip>*/}
                </div>

                {/* Contact info */}
                <div className="flex flex-col gap-1 text-xs">
                    {association.email ? (
                        <a
                            href={`mailto:${association.email}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
                        >
                            <MailIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                                {association.email}
                            </span>
                        </a>
                    ) : null}
                    {location ? (
                        <div className="text-muted-foreground flex items-center gap-1.5">
                            <MapPinIcon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{location.short}</span>
                        </div>
                    ) : null}
                </div>

                {/* Actions footer */}
                {canDelete ||
                canEdit ||
                canInvite ||
                (isPending && canApprove) ? (
                    <div className="mt-auto flex items-center gap-1 border-t pt-2">
                        {isPending && canApprove ? (
                            <>
                                <ApproveAssociationButton
                                    association={association}
                                />
                                <DeclineAssociationButton
                                    association={association}
                                />
                            </>
                        ) : null}
                        {!isPending && canEdit ? (
                            <EditAssociationButton association={association} />
                        ) : null}
                        {!isPending && canInvite ? (
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
                        {canDelete ? (
                            <div className="ml-auto">
                                <DeleteAssociationButton
                                    association={association}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
