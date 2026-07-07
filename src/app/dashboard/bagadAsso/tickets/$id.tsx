import { createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    BalloonIcon,
    HandCoinsIcon,
    ShapesIcon,
    SquareUserRoundIcon,
    UsersIcon
} from "lucide-react"
import {
    FaCalendarAlt,
    FaCaretLeft,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhone,
    FaUsers
} from "react-icons/fa"

import TicketActions from "@/components/dashboard/bagadAsso/tickets/ticketActions"
import Link from "@/components/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    computeTotalDeposit,
    joinTicketAndEquipment
} from "@/helpers/bagadAsso"
import prisma from "@/helpers/db"
import { locationDisplayName, parseLocation } from "@/helpers/location"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import { captureActionError } from "@/lib/sentry"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getTicketData = createServerFn()
    .validator((id: number) => id)
    .handler(async ({ data: ticketId }) => {
        const user = await getCurrentUserWithPermissions()
        const canEdit = !!user && hasPermission(user, "edit:bagad-ticket")
        const canDelete = !!user && hasPermission(user, "delete:bagad-ticket")

        const result = await tryCatch(
            prisma.bagadAssoTicket.findUnique({ where: { id: ticketId } })
        )
        if (!result.success) {
            captureActionError(result.error)
            return null
        }
        const ticket = result.value
        if (!ticket) return null

        const extras = await tryCatch(
            Promise.all([
                computeTotalDeposit(ticket),
                joinTicketAndEquipment(ticket)
            ])
        )
        if (!extras.success) {
            captureActionError(extras.error)
            return null
        }
        const [totalDeposit, joined] = extras.value

        const equipments: {
            id: number
            quantity: number
            deposit: number
            name: string
            imagePath: string | undefined
        }[] = JSON.parse(JSON.stringify(joined.equipments))

        return { ticket, totalDeposit, equipments, canEdit, canDelete }
    })

export const Route = createFileRoute("/dashboard/bagadAsso/tickets/$id")({
    loader: async ({ params }) => {
        const ticketId = Number(params.id)
        return {
            id: params.id,
            data: Number.isNaN(ticketId)
                ? null
                : await getTicketData({ data: ticketId })
        }
    },
    head: ({ loaderData }) => ({
        meta: [
            { title: dashboardTitle(`Bagad'Asso - Ticket ${loaderData?.id}`) }
        ]
    }),
    component: TicketPage
})

function TicketNotFound() {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <Card className="max-w-md">
                <CardContent className="pt-6 text-center">
                    <span className="text-4xl">😔</span>
                    <p className="text-muted-foreground mt-4 text-lg">
                        Le ticket n'existe pas
                    </p>
                    <Button asChild className="mt-4">
                        <Link href="/dashboard/bagadAsso">
                            Retour aux tickets
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

function TicketPage() {
    const { data } = Route.useLoaderData()

    if (!data) {
        return <TicketNotFound />
    }

    const { ticket, totalDeposit, equipments, canEdit, canDelete } = data

    const eventAddrLabel = locationDisplayName(ticket.eventAddr)
    const parsedEventAddr = parseLocation(ticket.eventAddr)
    const mapsHref = parsedEventAddr.success
        ? `https://www.google.com/maps/search/?api=1&query=${parsedEventAddr.value.coordinates.lat},${parsedEventAddr.value.coordinates.lon}`
        : `https://www.google.fr/maps/search/${encodeURIComponent(ticket.eventAddr)}`

    return (
        <div className="h-full w-full px-2 md:px-4">
            {/* Header */}
            <div className="mb-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="mb-4 -ml-3"
                >
                    <Link href="/dashboard/bagadAsso">
                        <FaCaretLeft className="mr-1" />
                        Retour aux tickets
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        Ticket{" "}
                        <span className="text-muted-foreground font-mono">
                            #{ticket.id}
                        </span>
                    </h1>
                    <Badge variant="secondary">
                        Créé le {format(ticket.creationDate, "dd/MM/yyyy")}
                    </Badge>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 pb-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Contact Information Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <SquareUserRoundIcon className="size-5" />
                                <span>Informations de contact</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-medium">
                                    {ticket.firstName} {ticket.lastName}
                                </p>
                                {ticket.position && (
                                    <p className="text-muted-foreground text-sm">
                                        {ticket.position}
                                    </p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <a
                                    href={`mailto:${ticket.representativeEmail}`}
                                    className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {ticket.representativeEmail}
                                </a>
                                {ticket.phoneNumber && (
                                    <a
                                        href={`tel:${ticket.phoneNumber}`}
                                        className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                                    >
                                        <FaPhone className="text-muted-foreground" />
                                        {ticket.phoneNumber}
                                    </a>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Association Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UsersIcon className="size-4" />
                                <span>Association</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-lg font-semibold">
                                {ticket.association}
                            </p>
                            <a
                                href={`mailto:${ticket.associationEmail}`}
                                className="hover:text-primary flex items-center gap-2 text-sm transition-colors"
                            >
                                <FaEnvelope className="text-muted-foreground" />
                                {ticket.associationEmail}
                            </a>
                        </CardContent>
                    </Card>

                    {/* Event Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BalloonIcon className="size-4" />
                                <span>Évènement</span>
                            </CardTitle>
                            <CardDescription>
                                Détails de l'évènement prévu
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-lg font-semibold">
                                    {ticket.eventName}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                    {ticket.eventType}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <FaCalendarAlt className="text-muted-foreground mt-0.5" />
                                    <span>
                                        {format(
                                            ticket.eventDate,
                                            "EEEE dd MMMM yyyy",
                                            { locale: fr }
                                        )}
                                    </span>
                                </div>
                                <a
                                    href={mapsHref}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary flex items-start gap-2 text-sm transition-colors"
                                >
                                    <FaMapMarkerAlt className="text-muted-foreground mt-0.5" />
                                    <span>{eventAddrLabel}</span>
                                </a>
                                <div className="flex items-center gap-2 text-sm">
                                    <FaUsers className="text-muted-foreground" />
                                    <span>
                                        {ticket.estimatedParticipants}{" "}
                                        participants estimés
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Equipment Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShapesIcon className="size-4" />
                                Matériels demandés
                            </CardTitle>
                            <CardDescription>
                                {equipments.length} type(s) de matériel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y rounded-lg border">
                                {equipments.map((equipment) => (
                                    <div
                                        key={equipment.id}
                                        className="flex items-center justify-between p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge
                                                variant="secondary"
                                                className="font-mono"
                                            >
                                                {equipment.quantity}×
                                            </Badge>
                                            <span className="font-medium">
                                                {equipment.name}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground text-sm">
                                            {equipment.quantity *
                                                equipment.deposit}
                                            €
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Deposit Summary Card */}
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HandCoinsIcon className="size-4" />
                                Caution totale
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-primary text-4xl font-bold">
                                {totalDeposit}€
                            </p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                À verser avant le retrait du matériel
                            </p>
                        </CardContent>
                    </Card>

                    {/* Ticket Actions */}
                    {canEdit || canDelete ? (
                        <TicketActions
                            ticketId={ticket.id}
                            ticketName={ticket.association}
                            isArchived={ticket.deleted !== null}
                            canEdit={canEdit}
                            canDelete={canDelete}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}
