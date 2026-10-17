import { ShapesIcon } from "lucide-react"

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

import TicketActions from "./ticketActions"
import { useTicketContext } from "./ticketContext"

export function TicketEquipment() {
    const { allEquipments, canDeleteTicket, canEditTicket, dispatch } =
        useTicketContext()

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
                                        <Badge
                                            variant="secondary"
                                            className="font-mono"
                                        >
                                            {equipment.quantity}×
                                        </Badge>
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
