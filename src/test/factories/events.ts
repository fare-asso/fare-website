import { imageFile } from "./files"

export function validEventFormData(
    overrides: Record<string, string | File> = {}
): FormData {
    const fd = new FormData()
    fd.set("name", "Soiree test")
    fd.set("description", "Une description suffisamment longue")
    fd.set("picture", imageFile("event.png"))
    fd.set("location", JSON.stringify({ label: "Rennes" }))
    fd.set("category", "Soiree")
    fd.set("startDate", "2026-06-01")
    fd.set("startHour", "18")
    fd.set("startMinute", "30")
    fd.set("endDate", "2026-06-01")
    fd.set("endHour", "23")
    fd.set("endMinute", "0")
    fd.set("visibility", "on")
    for (const [key, value] of Object.entries(overrides)) {
        fd.set(key, value)
    }
    return fd
}
