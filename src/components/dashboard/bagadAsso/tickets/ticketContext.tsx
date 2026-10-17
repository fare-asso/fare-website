import { type } from "arktype"
import { createContext, useContext, useReducer, useState } from "react"
import type { Dispatch, ReactNode, SetStateAction } from "react"

import type { BagadAssoTicket } from "@/generated/prisma/client"
import { tryCatch } from "@/lib/utils"

interface EquipmentLine {
    id: number
    quantity: number
    deposit: number
    name: string
    imagePath: string | undefined
    checked?: boolean | undefined
}

export interface TicketDetails {
    ticket: BagadAssoTicket
    allEquipments: EquipmentLine[]
    totalDeposit: number
    canEditTicket: boolean
    canDeleteTicket: boolean
}

type TicketAction =
    | { type: "setEquipmentChecked"; id: number; checked: boolean }
    | { type: "setEquipmentQuantity"; id: number; quantity: number }
    | { type: "setArchived"; deleted: Date | null }
    | { type: "setValidated"; validated: Date }

export interface TicketContextValue extends TicketDetails {
    dispatch: Dispatch<TicketAction>
    isEquipmentBusy: boolean
    setIsEquipmentBusy: Dispatch<SetStateAction<boolean>>
}

const StoredEquipments = type({ id: "number", quantity: "number" }).array()

function updateStoredQuantity(
    equipments: BagadAssoTicket["equipments"],
    id: number,
    quantity: number
): BagadAssoTicket["equipments"] {
    const parsed = tryCatch((): unknown =>
        typeof equipments === "string" ? JSON.parse(equipments) : equipments
    )
    if (!parsed.success) return equipments
    const stored = StoredEquipments(parsed.value)
    if (stored instanceof type.errors) return equipments
    const updated = stored.map((equipment): typeof equipment =>
        equipment.id === id ? { ...equipment, quantity } : equipment
    )
    return typeof equipments === "string" ? JSON.stringify(updated) : updated
}

export function ticketReducer(
    state: TicketDetails,
    action: TicketAction
): TicketDetails {
    switch (action.type) {
        case "setEquipmentQuantity": {
            if (
                !Number.isSafeInteger(action.quantity) ||
                action.quantity < 1 ||
                !state.allEquipments.some(
                    (equipment): boolean => equipment.id === action.id
                )
            )
                return state
            const allEquipments = state.allEquipments.map(
                (equipment): EquipmentLine =>
                    equipment.id === action.id
                        ? { ...equipment, quantity: action.quantity }
                        : equipment
            )
            return {
                ...state,
                allEquipments,
                totalDeposit: allEquipments.reduce(
                    (total, equipment): number =>
                        total + equipment.quantity * equipment.deposit,
                    0
                ),
                ticket: {
                    ...state.ticket,
                    equipments: updateStoredQuantity(
                        state.ticket.equipments,
                        action.id,
                        action.quantity
                    )
                }
            }
        }
        case "setEquipmentChecked":
            return {
                ...state,
                allEquipments: state.allEquipments.map((equipment) =>
                    equipment.id === action.id
                        ? { ...equipment, checked: action.checked }
                        : equipment
                )
            }
        case "setArchived":
            return {
                ...state,
                ticket: { ...state.ticket, deleted: action.deleted }
            }
        case "setValidated":
            return {
                ...state,
                ticket: { ...state.ticket, validated: action.validated }
            }
    }
}

const TicketContext = createContext<TicketContextValue | undefined>(undefined)

export function TicketProvider({
    children,
    ...initialTicketDetails
}: TicketDetails & { children: ReactNode }): ReactNode {
    const [ticketDetails, dispatch] = useReducer(
        ticketReducer,
        initialTicketDetails
    )

    const [isEquipmentBusy, setIsEquipmentBusy] = useState(false)

    return (
        <TicketContext.Provider
            value={{
                ...ticketDetails,
                dispatch,
                isEquipmentBusy,
                setIsEquipmentBusy
            }}
        >
            {children}
        </TicketContext.Provider>
    )
}

export function useTicketContext(): TicketContextValue {
    const ticketContext = useContext(TicketContext)
    if (!ticketContext) {
        throw new Error("useTicketContext must be used within a TicketProvider")
    }

    return ticketContext
}
