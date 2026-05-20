"use client"

import Image from "next/image"

import type { Partenaire } from "@/generated/prisma/client"

import DeletePartenaireButton from "./deletePartenaireButton"
import EditPartenaireButton from "./editPartenaireButton"

interface PartenaireCardProps {
    partenaire: Partenaire
    logoUrl: string
    canEdit: boolean
    canDelete: boolean
}

export default function PartenaireCard({
    partenaire,
    logoUrl,
    canEdit,
    canDelete
}: PartenaireCardProps): React.JSX.Element {
    return (
        <div className="group bg-card flex flex-col rounded-lg border shadow-xs transition-shadow hover:shadow-md">
            {/* Logo area */}
            <div className="bg-muted/50 group-hover:bg-muted relative flex items-center justify-center rounded-t-lg transition-colors">
                <Image
                    src={logoUrl}
                    width={220}
                    height={220}
                    alt={`Logo de ${partenaire.name}`}
                    className="aspect-square w-full rounded-md object-contain"
                />
            </div>

            {/* Content area */}
            <div className="flex flex-1 flex-col gap-2 p-3">
                {/* Name */}
                <h3 className="line-clamp-1 text-sm leading-tight font-medium">
                    {partenaire.name}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground line-clamp-3 text-xs">
                    {partenaire.description}
                </p>

                {/* Actions footer */}
                {canDelete || canEdit ? (
                    <div className="mt-auto flex items-center gap-1 border-t pt-2">
                        {canEdit ? (
                            <EditPartenaireButton partenaire={partenaire} />
                        ) : null}
                        {canDelete ? (
                            <div className="ml-auto">
                                <DeletePartenaireButton
                                    partenaire={partenaire}
                                />
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
