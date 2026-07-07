import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns"
import { fr } from "date-fns/locale"
import { BoxIcon, CalendarClockIcon, CoinsIcon } from "lucide-react"
import { MdOutlineHideImage } from "react-icons/md"

import Image from "@/components/image"
import Link from "@/components/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { BagadAssoEquipment } from "@/generated/prisma/client"
import type { EquipmentNextBooking } from "@/helpers/bagadAsso.server"

import DeleteEquipmentButton from "./deleteEquipmentButton"
import EditEquipmentDialog from "./editEquipmentDialog"

interface EquipmentCardProps {
    equipment: BagadAssoEquipment
    imageUrl: string | null
    nextBooking: EquipmentNextBooking | null
    canEdit: boolean
    canDelete: boolean
}

export default function EquipmentCard({
    equipment,
    imageUrl,
    nextBooking,
    canEdit,
    canDelete
}: EquipmentCardProps) {
    return (
        <Card className="@container flex flex-row items-stretch gap-4 overflow-hidden p-3 transition-shadow hover:shadow-md">
            {/* Image */}
            <div className="bg-muted relative aspect-square size-20 shrink-0 self-center overflow-hidden rounded-md @md:size-24">
                {imageUrl ? (
                    <Image
                        fill
                        sizes="96px"
                        alt={`Photo de ${equipment.name}`}
                        className="object-cover"
                        src={imageUrl}
                    />
                ) : (
                    <div className="text-muted-foreground/50 flex h-full w-full items-center justify-center">
                        <MdOutlineHideImage className="size-7" />
                    </div>
                )}
            </div>

            {/* Info + booking */}
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 @md:flex-row @md:items-center">
                {/* Title + meta */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <h3 className="line-clamp-2 text-base leading-tight font-semibold">
                        {equipment.name}
                    </h3>
                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                        <span className="flex items-center gap-1">
                            <CoinsIcon className="size-3.5" />
                            {equipment.deposit}€ de caution
                        </span>
                        <span className="flex items-center gap-1">
                            <BoxIcon className="size-3.5" />
                            {equipment.quantity} en stock
                        </span>
                    </div>
                </div>

                {/* Next booking */}
                <NextBooking booking={nextBooking} />
            </div>

            {/* Actions */}
            {canEdit || canDelete ? (
                <div className="flex shrink-0 flex-col justify-center gap-1.5">
                    {canEdit ? (
                        <EditEquipmentDialog
                            equipment={equipment}
                            currentImageUrl={imageUrl}
                        />
                    ) : null}
                    {canDelete ? (
                        <DeleteEquipmentButton equipmentId={equipment.id} />
                    ) : null}
                </div>
            ) : null}
        </Card>
    )
}

function NextBooking({ booking }: { booking: EquipmentNextBooking | null }) {
    if (!booking) {
        return (
            <div className="text-muted-foreground/70 flex w-full items-center justify-center rounded-md border border-dashed px-3 py-2 text-xs @md:w-52">
                Aucune réservation à venir
            </div>
        )
    }

    const date = new Date(booking.eventDate)
    const relative = isToday(date)
        ? "Aujourd'hui"
        : isTomorrow(date)
          ? "Demain"
          : formatDistanceToNow(date, { addSuffix: true, locale: fr })

    return (
        <Link
            href={`/dashboard/bagadAsso/tickets/${booking.ticketId}`}
            className="border-primary/15 bg-primary/5 hover:bg-primary/10 block w-full shrink-0 rounded-md border px-3 py-2 transition-colors @md:w-52"
        >
            <div className="text-primary/70 mb-1 flex items-center justify-between gap-2 text-[0.65rem] font-medium tracking-wide uppercase">
                <span className="flex items-center gap-1">
                    <CalendarClockIcon className="size-3" />
                    Prochaine réservation
                </span>
                <Badge variant="secondary" className="font-mono">
                    {booking.quantity}×
                </Badge>
            </div>
            <p className="text-sm leading-tight font-medium capitalize">
                {relative}
            </p>
            <p className="text-muted-foreground mt-0.5 truncate text-xs">
                {format(date, "d MMM yyyy", { locale: fr })} ·{" "}
                {booking.association}
            </p>
        </Link>
    )
}
