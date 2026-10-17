import { actions } from "astro:actions"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CheckCircle2Icon,
    MailIcon,
    Trash2Icon
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import LoadingRing from "@/components/dashboard/loadingRing"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { tryCatch } from "@/lib/utils"

import { useTicketContext } from "./ticketContext"

export default function TicketActions() {
    const {
        ticket,
        allEquipments,
        canDeleteTicket,
        canEditTicket,
        dispatch,
        isEquipmentBusy
    } = useTicketContext()
    const [isLoading, setIsLoading] = useState(false)
    const [includeCommunication, setIncludeCommunication] = useState(true)
    const [openDialog, setOpenDialog] = useState<
        "contract" | "archive" | "delete" | null
    >(null)
    const isArchived = ticket.deleted !== null

    const onSendContract = async (): Promise<void> => {
        if (isLoading || isEquipmentBusy) return
        setIsLoading(true)
        const result = await tryCatch(async () => ({
            response: await actions.bagadAsso.sendContractAction({
                ticketId: ticket.id,
                equipmentIds: allEquipments
                    .filter(
                        (equipment) => equipment.checked && !equipment.deletedAt
                    )
                    .map((equipment) => equipment.id),
                includeCommunication
            })
        }))
        const { data, error } = result.success
            ? result.value.response
            : { data: undefined, error: result.error }
        if (error || !data?.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le contrat a été envoyé.")
            dispatch({ type: "setValidated", validated: new Date() })
        }
        setIsLoading(false)
        setOpenDialog(null)
    }

    const onArchive = async (): Promise<void> => {
        if (isLoading || isEquipmentBusy) return
        setIsLoading(true)

        const result = await tryCatch(async () => ({
            response: await actions.bagadAsso.deleteBagadAssoTicketAction(
                ticket.id
            )
        }))
        const { data, error } = result.success
            ? result.value.response
            : { data: undefined, error: result.error }

        if (error || !data?.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été archivé.")
            dispatch({ type: "setArchived", deleted: new Date() })
        }
        setIsLoading(false)
        setOpenDialog(null)
    }

    const onUnarchive = async (): Promise<void> => {
        if (isLoading || isEquipmentBusy) return
        setIsLoading(true)

        const result = await tryCatch(async () => ({
            response: await actions.bagadAsso.unarchiveBagadAssoTicketAction(
                ticket.id
            )
        }))
        const { data, error } = result.success
            ? result.value.response
            : { data: undefined, error: result.error }

        if (error || !data?.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été désarchivé.")
            dispatch({ type: "setArchived", deleted: null })
        }
        setIsLoading(false)
        setOpenDialog(null)
    }

    const onHardDelete = async (): Promise<void> => {
        if (isLoading || isEquipmentBusy) return
        setIsLoading(true)

        const result = await tryCatch(async () => ({
            response: await actions.bagadAsso.hardDeleteBagadAssoTicketAction(
                ticket.id
            )
        }))
        const { data, error } = result.success
            ? result.value.response
            : { data: undefined, error: result.error }
        setIsLoading(false)
        setOpenDialog(null)

        if (error || !data?.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été supprimé définitivement.")
            window.location.href = "/dashboard/bagadAsso"
        }
    }

    return (
        <div className="border-muted-foreground/30 flex flex-col gap-3 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Actions sur le ticket
            </p>
            <div className="flex flex-col flex-wrap gap-2">
                {/* Archive / Unarchive Button */}
                {canEditTicket ? (
                    <>
                        {ticket.validated ? (
                            <div className="mx-auto my-2 flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2Icon className="h-4 w-4" />
                                Contrat envoyé
                            </div>
                        ) : (
                            <AlertDialog
                                open={openDialog === "contract"}
                                onOpenChange={(open): void => {
                                    if (!isLoading)
                                        setOpenDialog(open ? "contract" : null)
                                }}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            isLoading ||
                                            isArchived ||
                                            isEquipmentBusy
                                        }
                                        className="gap-2"
                                    >
                                        <MailIcon className="h-4 w-4" />
                                        Envoyer le contrat
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Envoyer le contrat ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div>
                                                Le contrat pour le ticket{" "}
                                                <b className="text-accent-foreground">
                                                    #{ticket.id}
                                                </b>{" "}
                                                sera envoyé à{" "}
                                                <b className="text-accent-foreground">
                                                    {ticket.associationEmail}
                                                </b>{" "}
                                                (copie à{" "}
                                                {ticket.representativeEmail})
                                                avec les équipements suivants :
                                                <ul className="my-2">
                                                    {allEquipments.filter(
                                                        (eq) =>
                                                            eq.checked &&
                                                            !eq.deletedAt
                                                    ).length === 0 && (
                                                        <li className="text-muted-foreground p-3 text-sm">
                                                            Sélectionnez au
                                                            moins un équipement
                                                            avant l'envoi.
                                                        </li>
                                                    )}
                                                    {allEquipments
                                                        .filter(
                                                            (eq) =>
                                                                eq.checked &&
                                                                !eq.deletedAt
                                                        )
                                                        .map((equipment) => (
                                                            <li
                                                                key={
                                                                    equipment.id
                                                                }
                                                                className="ml-8 list-disc"
                                                            >
                                                                <b className="text-accent-foreground font-medium">
                                                                    {
                                                                        equipment.allocatedQuantity
                                                                    }
                                                                    x
                                                                </b>{" "}
                                                                {equipment.name}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="contract-communication"
                                            checked={includeCommunication}
                                            disabled={isLoading}
                                            onCheckedChange={(checked): void =>
                                                setIncludeCommunication(
                                                    checked === true
                                                )
                                            }
                                        />
                                        <div className="space-y-1">
                                            <FieldLabel htmlFor="contract-communication">
                                                Inclure la clause de
                                                communication
                                            </FieldLabel>
                                            <p className="text-muted-foreground text-sm">
                                                Inclut le kit de communication
                                                et les modèles Canva dans
                                                l'email.
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel disabled={isLoading}>
                                            Annuler
                                        </AlertDialogCancel>
                                        <Button
                                            aria-busy={isLoading}
                                            disabled={
                                                isLoading ||
                                                isEquipmentBusy ||
                                                !allEquipments.some(
                                                    (equipment) =>
                                                        equipment.checked &&
                                                        !equipment.deletedAt
                                                )
                                            }
                                            onClick={onSendContract}
                                        >
                                            {isLoading && (
                                                <LoadingRing className="m-0!" />
                                            )}
                                            Envoyer
                                        </Button>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <AlertDialog
                            open={openDialog === "archive"}
                            onOpenChange={(open): void => {
                                if (!isLoading)
                                    setOpenDialog(open ? "archive" : null)
                            }}
                        >
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading || isEquipmentBusy}
                                    className="gap-2"
                                >
                                    {isArchived ? (
                                        <ArchiveRestoreIcon className="h-4 w-4" />
                                    ) : (
                                        <ArchiveIcon className="h-4 w-4" />
                                    )}
                                    {isArchived ? "Désarchiver" : "Archiver"}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        {isArchived
                                            ? "Désarchiver le ticket ?"
                                            : "Archiver le ticket ?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div>
                                            {isArchived ? (
                                                <p>
                                                    Le ticket #{ticket.id} pour
                                                    "{ticket.association}" sera
                                                    restauré et réapparaîtra
                                                    dans la liste des tickets
                                                    actifs.
                                                </p>
                                            ) : (
                                                <>
                                                    <p>
                                                        Le ticket #{ticket.id}{" "}
                                                        pour "
                                                        {ticket.association}"
                                                        sera marqué comme traité
                                                        et masqué de la liste.
                                                    </p>
                                                    <p className="mt-1">
                                                        Il pourra être restauré
                                                        si besoin.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isLoading}>
                                        Annuler
                                    </AlertDialogCancel>
                                    <Button
                                        disabled={isLoading}
                                        aria-busy={isLoading}
                                        onClick={
                                            isArchived ? onUnarchive : onArchive
                                        }
                                    >
                                        {isLoading && (
                                            <LoadingRing className="m-0!" />
                                        )}
                                        {isArchived
                                            ? "Désarchiver"
                                            : "Archiver"}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                ) : null}

                {/* Hard Delete Button */}
                {canDeleteTicket ? (
                    <AlertDialog
                        open={openDialog === "delete"}
                        onOpenChange={(open): void => {
                            if (!isLoading)
                                setOpenDialog(open ? "delete" : null)
                        }}
                    >
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isLoading || isEquipmentBusy}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                            >
                                <Trash2Icon className="h-4 w-4" />
                                Supprimer définitivement
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Supprimer définitivement le ticket ?
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-2">
                                        <p>
                                            Le ticket #{ticket.id} pour "
                                            {ticket.association}" sera{" "}
                                            <span className="text-destructive font-semibold">
                                                supprimé de manière permanente
                                            </span>
                                            .
                                        </p>
                                        <p>
                                            Cette action est irréversible et
                                            toutes les données associées seront
                                            perdues.
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Utilisez cette option uniquement
                                            pour les doublons ou les tickets
                                            créés par erreur.
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoading}>
                                    Annuler
                                </AlertDialogCancel>
                                <Button
                                    disabled={isLoading}
                                    aria-busy={isLoading}
                                    onClick={onHardDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    {isLoading && (
                                        <LoadingRing className="m-0!" />
                                    )}
                                    Supprimer définitivement
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : null}
            </div>
        </div>
    )
}
