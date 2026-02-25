import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    BalloonIcon,
    HandCoinsIcon,
    ShapesIcon,
    SquareUserRoundIcon,
    UsersIcon
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import {
    FaCalendarAlt,
    FaCaretLeft,
    FaEnvelope,
    FaMapMarkerAlt,
    FaPhone,
    FaUsers
} from "react-icons/fa"
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
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"
import TicketActions from "./ticketActions"

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const id = (await params).id
    return {
        title: `Bagad'Asso - Ticket ${id}`
    }
}

export default async function Page({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const ticketId = Number((await params).id)

    const user = await getCurrentUserWithPermissions()
    const canEditTicket = !!user && hasPermission(user, "edit:bagad-ticket")
    const canDeleteTicket = !!user && hasPermission(user, "delete:bagad-ticket")

    if (Number.isNaN(ticketId)) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <span className="text-4xl">😔</span>
                        <p className="mt-4 text-lg text-muted-foreground">
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

    const ticket = await prisma.bagadAssoTicket.findUnique({
        where: {
            id: ticketId
        }
    })

    if (!ticket) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <span className="text-4xl">😔</span>
                        <p className="mt-4 text-lg text-muted-foreground">
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

    const totalDeposit = await computeTotalDeposit(ticket)

    const allEquipments: {
        id: number
        quantity: number
        deposit: number
        name: string
        imagePath: string | undefined
    }[] = JSON.parse(
        JSON.stringify((await joinTicketAndEquipment(ticket)).equipments)
    )

    return (
        <div className="h-full w-full px-2 md:px-4">
            {/* Header */}
            <div className="mb-6">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="-ml-3 mb-4"
                >
                    <Link href="/dashboard/bagadAsso">
                        <FaCaretLeft className="mr-1" />
                        Retour aux tickets
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-bold text-3xl">
                        Ticket{" "}
                        <span className="font-mono text-muted-foreground">
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
                                <p className="font-medium text-lg">
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
                                    className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
                                >
                                    <FaEnvelope className="text-muted-foreground" />
                                    {ticket.representativeEmail}
                                </a>
                                {ticket.phoneNumber && (
                                    <a
                                        href={`tel:${ticket.phoneNumber}`}
                                        className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
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
                            <p className="font-semibold text-lg">
                                {ticket.assocation}
                            </p>
                            <a
                                href={`mailto:${ticket.associationEmail}`}
                                className="flex items-center gap-2 text-sm transition-colors hover:text-primary"
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
                                <p className="font-semibold text-lg">
                                    {ticket.eventName}
                                </p>
                                <Badge variant="outline" className="mt-1">
                                    {ticket.eventType}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="grid gap-3">
                                <div className="flex items-start gap-2 text-sm">
                                    <FaCalendarAlt className="mt-0.5 text-muted-foreground" />
                                    <span>
                                        {format(
                                            ticket.eventDate,
                                            "EEEE dd MMMM yyyy",
                                            { locale: fr }
                                        )}
                                    </span>
                                </div>
                                <a
                                    href={`https://www.google.fr/maps/search/${ticket.eventAddr}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-start gap-2 text-sm transition-colors hover:text-primary"
                                >
                                    <FaMapMarkerAlt className="mt-0.5 text-muted-foreground" />
                                    <span>{ticket.eventAddr}</span>
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
                                {allEquipments.length} type(s) de matériel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y rounded-lg border">
                                {allEquipments.map((equipment) => (
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
                            <p className="font-bold text-4xl text-primary">
                                {totalDeposit}€
                            </p>
                            <p className="mt-1 text-muted-foreground text-sm">
                                À verser avant le retrait du matériel
                            </p>
                        </CardContent>
                    </Card>

                    {/* Ticket Actions */}
                    {canEditTicket || canDeleteTicket ? (
                        <TicketActions
                            ticketId={ticket.id}
                            ticketName={ticket.assocation}
                            isArchived={ticket.deleted !== null}
                            canEdit={canEditTicket}
                            canDelete={canDeleteTicket}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    )
}
