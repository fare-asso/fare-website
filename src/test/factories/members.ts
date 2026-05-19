import type { Member } from "@/generated/prisma/client"

export function validMemberFormData(
    overrides: Record<string, string> = {}
): FormData {
    const fd = new FormData()
    fd.set("lastName", "Martin")
    fd.set("firstName", "Lea")
    fd.set("position", "Tresoriere")
    fd.set("picturePath", "members/lea.png")
    fd.set("email", "lea@example.com")
    fd.set("facebook", "")
    fd.set("instagram", "")
    fd.set("twitter", "")
    for (const [key, value] of Object.entries(overrides)) {
        fd.set(key, value)
    }
    return fd
}

export function validMemberRecord(overrides: Partial<Member> = {}): Member {
    return {
        id: 1,
        firstName: "Lea",
        lastName: "Martin",
        email: "lea@example.com",
        facebookUrl: null,
        instagramUrl: null,
        twitterUrl: null,
        picturePath: "members/lea.png",
        position: "Tresoriere",
        order: 0,
        ...overrides
    }
}
