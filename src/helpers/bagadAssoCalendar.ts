import type { BagadAssoTicket } from "@/generated/prisma/client"
import { locationDisplayName } from "@/helpers/location"

const PRODID = "-//FARE//Bagad'Asso//FR"
const CALENDAR_NAME = "Bagad'Asso"

function escapeText(value: string): string {
    return value
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\r?\n/g, "\\n")
}

function pad(value: number): string {
    return value.toString().padStart(2, "0")
}

function toUtcDate(date: Date): string {
    return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`
}

function toUtcStamp(date: Date): string {
    return `${toUtcDate(date)}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
}

function foldLine(line: string): string {
    const encoder = new TextEncoder()
    let result = ""
    let segment = ""
    let segmentBytes = 0
    for (const char of line) {
        const charBytes = encoder.encode(char).length
        const limit = result === "" ? 75 : 74
        if (segmentBytes + charBytes > limit) {
            result += `${result === "" ? "" : "\r\n "}${segment}`
            segment = char
            segmentBytes = charBytes
        } else {
            segment += char
            segmentBytes += charBytes
        }
    }
    return `${result}${result === "" ? "" : "\r\n "}${segment}`
}

function buildEvent(ticket: BagadAssoTicket): string[] {
    const referent =
        `${ticket.firstName} ${ticket.lastName}` +
        (ticket.position ? ` (${ticket.position})` : "")

    const description = [
        `Type : ${ticket.eventType}`,
        `Association : ${ticket.assocation}`,
        `Participants estimés : ${ticket.estimatedParticipants}`,
        `Référent : ${referent}`,
        `Email référent : ${ticket.representativeEmail}`,
        `Email association : ${ticket.associationEmail}`,
        ticket.phoneNumber ? `Téléphone : ${ticket.phoneNumber}` : null
    ]
        .filter((line): line is string => line !== null)
        .join("\n")

    return [
        "BEGIN:VEVENT",
        `UID:bagad-asso-${ticket.id}@fare-asso.fr`,
        `DTSTAMP:${toUtcStamp(ticket.creationDate)}`,
        `DTSTART;VALUE=DATE:${toUtcDate(ticket.eventDate)}`,
        `SUMMARY:${escapeText(`${ticket.eventName} (${ticket.assocation})`)}`,
        `LOCATION:${escapeText(locationDisplayName(ticket.eventAddr))}`,
        `DESCRIPTION:${escapeText(description)}`,
        "END:VEVENT"
    ]
}

export function buildBagadAssoCalendar(tickets: BagadAssoTicket[]): string {
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        `PRODID:${PRODID}`,
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        `NAME:${CALENDAR_NAME}`,
        `X-WR-CALNAME:${CALENDAR_NAME}`,
        ...tickets.flatMap(buildEvent),
        "END:VCALENDAR"
    ]
    return `${lines.map(foldLine).join("\r\n")}\r\n`
}
