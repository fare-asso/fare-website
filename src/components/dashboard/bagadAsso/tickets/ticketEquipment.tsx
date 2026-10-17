import { actions } from "astro:actions"
import { ShapesIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { queryClient } from "@/lib/queryClient"
import { tryCatch } from "@/lib/utils"

import TicketActions from "./ticketActions"
import { useTicketContext } from "./ticketContext"

export function TicketEquipment(): ReactNode {
    const {
        ticket,
        allEquipments,
        canDeleteTicket,
        canEditTicket,
        dispatch,
        isEquipmentBusy,
        setIsEquipmentBusy
    } = useTicketContext()
    const [editingId, setEditingId] = useState<number | null>(null)
    const [quantity, setQuantity] = useState("")
    const [validationError, setValidationError] = useState("")
    const [isPending, setIsPending] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const quantityButtons = useRef(new Map<number, HTMLButtonElement>())
    const returnFocusId = useRef<number | null>(null)
    // Refs guard Enter/Escape followed by blur before React rerenders.
    const activeId = useRef<number | null>(null)
    const pending = useRef(false)
    const canEditQuantity =
        canEditTicket && !ticket.deleted && !ticket.validated

    useEffect((): void => {
        if (editingId !== null) {
            inputRef.current?.focus()
            inputRef.current?.select()
        } else if (returnFocusId.current !== null) {
            quantityButtons.current.get(returnFocusId.current)?.focus()
            returnFocusId.current = null
        }
    }, [editingId])

    function finishEditing(): void {
        returnFocusId.current = activeId.current
        activeId.current = null
        setEditingId(null)
        setIsEquipmentBusy(false)
        setValidationError("")
    }

    function startEditing(id: number, originalQuantity: number): void {
        if (!canEditQuantity || isEquipmentBusy || pending.current) return
        activeId.current = id
        setEditingId(id)
        setQuantity(String(originalQuantity))
        setValidationError("")
        setIsEquipmentBusy(true)
    }

    async function saveQuantity(): Promise<void> {
        const id = activeId.current
        if (id === null || pending.current || !canEditQuantity) return
        const value = Number(quantity)
        if (!Number.isSafeInteger(value) || value < 1) {
            setValidationError(
                "La quantité doit être un entier strictement positif."
            )
            return
        }
        if (
            allEquipments.find((equipment): boolean => equipment.id === id)
                ?.quantity === value
        ) {
            finishEditing()
            return
        }
        pending.current = true
        setIsPending(true)
        const result = await tryCatch(
            async (): Promise<{
                response: Awaited<
                    ReturnType<
                        typeof actions.bagadAsso.updateTicketEquipmentQuantityAction
                    >
                >
            }> => ({
                response:
                    await actions.bagadAsso.updateTicketEquipmentQuantityAction(
                        {
                            ticketId: ticket.id,
                            equipmentId: id,
                            quantity: value
                        }
                    )
            })
        )
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
            dispatch({
                type: "setEquipmentQuantity",
                id,
                quantity: data.value.quantity
            })
            void tryCatch(() =>
                Promise.all([
                    queryClient.invalidateQueries({
                        queryKey: ["bagadTickets"]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["bagadEquipments"]
                    }),
                    queryClient.invalidateQueries({
                        queryKey: ["bagadCalendar"]
                    })
                ])
            )
        }
        pending.current = false
        setIsPending(false)
        finishEditing()
    }

    return (
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_auto]">
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
                                className="grid grid-cols-[auto_1fr] items-center gap-3 p-3"
                            >
                                <Checkbox
                                    id={`item-${equipment.id}`}
                                    checked={equipment.checked}
                                    onCheckedChange={(checked) =>
                                        dispatch({
                                            type: "setEquipmentChecked",
                                            id: equipment.id,
                                            checked: checked === true
                                        })
                                    }
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {editingId === equipment.id ? (
                                            <div aria-busy={isPending}>
                                                <Input
                                                    ref={inputRef}
                                                    type="number"
                                                    min={1}
                                                    step={1}
                                                    className="h-5.5 w-12 font-mono"
                                                    aria-label={`Quantité pour ${equipment.name}`}
                                                    aria-invalid={Boolean(
                                                        validationError
                                                    )}
                                                    aria-describedby={
                                                        validationError
                                                            ? `quantity-error-${ticket.id}-${equipment.id}`
                                                            : undefined
                                                    }
                                                    value={quantity}
                                                    disabled={isPending}
                                                    onChange={(event): void => {
                                                        setQuantity(
                                                            event.target.value
                                                        )
                                                        setValidationError("")
                                                    }}
                                                    onBlur={(): void => {
                                                        void saveQuantity()
                                                    }}
                                                    onKeyDown={(
                                                        event
                                                    ): void => {
                                                        if (
                                                            event.key ===
                                                            "Enter"
                                                        ) {
                                                            event.preventDefault()
                                                            void saveQuantity()
                                                        } else if (
                                                            event.key ===
                                                            "Escape"
                                                        ) {
                                                            event.preventDefault()
                                                            if (
                                                                !pending.current
                                                            )
                                                                finishEditing()
                                                        }
                                                    }}
                                                />
                                                {validationError ? (
                                                    <p
                                                        id={`quantity-error-${ticket.id}-${equipment.id}`}
                                                        role="alert"
                                                        className="text-destructive text-sm"
                                                    >
                                                        {validationError}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ) : canEditQuantity ? (
                                            <Badge
                                                variant="secondary"
                                                className="font-mono"
                                                asChild
                                            >
                                                <button
                                                    ref={(button): void => {
                                                        if (button) {
                                                            quantityButtons.current.set(
                                                                equipment.id,
                                                                button
                                                            )
                                                        } else {
                                                            quantityButtons.current.delete(
                                                                equipment.id
                                                            )
                                                        }
                                                    }}
                                                    type="button"
                                                    aria-label={`Modifier la quantité pour ${equipment.name}`}
                                                    disabled={isEquipmentBusy}
                                                    onClick={(): void =>
                                                        startEditing(
                                                            equipment.id,
                                                            equipment.quantity
                                                        )
                                                    }
                                                >
                                                    {equipment.quantity}×
                                                </button>
                                            </Badge>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="font-mono"
                                            >
                                                {equipment.quantity}×
                                            </Badge>
                                        )}
                                        <FieldLabel
                                            className="w-full font-medium"
                                            htmlFor={`item-${equipment.id}`}
                                        >
                                            {equipment.name}
                                        </FieldLabel>
                                    </div>
                                    <span className="text-muted-foreground text-sm">
                                        {equipment.quantity * equipment.deposit}
                                        €
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Ticket Actions */}
            {canEditTicket || canDeleteTicket ? <TicketActions /> : null}
        </div>
    )
}
