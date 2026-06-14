import type { Member } from "@/generated/prisma/client"
import type { TAddMember, TEditMember } from "@/schemas/members"

import { imageFile } from "./files"

export function validAddMember(
    overrides: Partial<TAddMember> = {}
): TAddMember {
    return {
        firstName: "Lea",
        lastName: "Martin",
        position: "Tresoriere",
        email: "lea@example.com",
        facebook: "",
        instagram: "",
        twitter: "",
        picture: imageFile("lea.png"),
        ...overrides
    }
}

export function validEditMember(
    overrides: Partial<TEditMember> = {}
): TEditMember {
    return {
        id: 1,
        firstName: "Lea",
        lastName: "Martin",
        position: "Tresoriere",
        email: "lea@example.com",
        facebook: "",
        instagram: "",
        twitter: "",
        ...overrides
    }
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
