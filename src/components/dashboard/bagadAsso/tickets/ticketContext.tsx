import { createContext, useContext, useReducer } from "react"
import type { Dispatch, ReactNode } from "react"

import type { BagadAssoTicket } from "@/generated/prisma/client"

export interface EquipmentLine {
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
    | { type: "setArchived"; deleted: Date | null }
    | { type: "setValidated"; validated: Date }

export interface TicketContextValue extends TicketDetails {
    dispatch: Dispatch<TicketAction>
}

export function ticketReducer(
    state: TicketDetails,
    action: TicketAction
): TicketDetails {
    switch (action.type) {
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

export const TicketContext = createContext<TicketContextValue | undefined>(
    undefined
)

export function TicketProvider({
    children,
    ...initialTicketDetails
}: TicketDetails & { children: ReactNode }): ReactNode {
    const [ticketDetails, dispatch] = useReducer(
        ticketReducer,
        initialTicketDetails
    )

    return (
        <TicketContext.Provider value={{ ...ticketDetails, dispatch }}>
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
