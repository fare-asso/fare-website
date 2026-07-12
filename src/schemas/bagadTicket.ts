import { type } from "arktype"

export const SetTicketValidatedSchema = type({
    ticketId: "number.integer > 0",
    validated: "boolean"
})

export type TSetTicketValidated = typeof SetTicketValidatedSchema.infer
