import { createContext, useContext, useReducer, useState } from "react"
import type { Dispatch, ReactNode, SetStateAction } from "react"

import type { BagadAssoTicket } from "@/generated/prisma/client"
import type { TicketEquipmentLine } from "@/helpers/bagadAsso/ticketEquipment"

export interface TicketDetails {
    ticket: BagadAssoTicket
    allEquipments: TicketEquipmentLine[]
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
                (equipment): TicketEquipmentLine =>
                    equipment.id === action.id
                        ? { ...equipment, allocatedQuantity: action.quantity }
                        : equipment
            )
            return {
                ...state,
                allEquipments,
                totalDeposit: allEquipments.reduce(
                    (total, equipment): number =>
                        total + equipment.allocatedQuantity * equipment.deposit,
                    0
                )
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
                ticket: { ...state.ticket, validated: action.validated },
                allEquipments: state.allEquipments.map(
                    (equipment): TicketEquipmentLine => ({
                        ...equipment,
                        includedInContract: Boolean(
                            equipment.checked && !equipment.deletedAt
                        ),
                        checked: Boolean(
                            equipment.checked && !equipment.deletedAt
                        )
                    })
                )
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
