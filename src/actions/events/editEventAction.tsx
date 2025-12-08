"use server"

import prisma from "@/helpers/db"
import { revalidatePath } from "next/cache"

import { createClient } from "@/helpers/supabase/server"
import { randomUUID } from "crypto"
import getCurrentUserId from "@/helpers/user/id"
import getCurrentUserRole from "@/helpers/user/role"

interface Event {
    id?: number
    name?: string
    desc?: string
    image?: string
    startTime?: Date
    endTime?: Date
    location?: string
    categoryId?: number
    creatorId?: number
    visibility?: boolean
}

export default async function editEventAction(
    prevState: { error?: string; success?: boolean } | undefined,
    formData: FormData
) {
    /* SUPER IMPORTANT : Auth and role verifications */
    const { role, error } = await getCurrentUserRole()
    if (error) return { error: "Echec de l'authentification de l'utilisateur" }
    if (role != "ADMIN")
        return {
            error: "Vous devez avoir les droits administrateur pour effectuer cette opération."
        }

    // create supabase client
    const supabase = await createClient()

    // retrieve formdata fields
    const id = formData.get("id")

    const name = formData.get("name")
    const description = formData.get("description")

    const picture = formData.get("picture")
    const previousPath = formData.get("previousPath")

    const location = formData.get("location")
    const category = formData.get("category")

    const startDate = formData.get("startDate")
    const startHour = formData.get("startHour")
    const startMinute = formData.get("startMinute")

    const endDate = formData.get("endDate")
    const endHour = formData.get("endHour")
    const endMinute = formData.get("endMinute")

    const visibility = formData.get("visibility")

    // create a temp variable to gradually store each data after their validation
    const data: Event = {}

    /* Data validation */

    //id
    if (id != null && typeof id == "string") {
        const idStr: string = id.toString()
        const idNumber: number = Number(idStr)
        if (isNaN(idNumber)) {
            return {
                error: "L'identifiant n'est pas un nombre..."
            }
        } else {
            data.id = idNumber
        }
    } else {
        return {
            error: "L'identifiant de l'évènement n'est pas correct"
        }
    }

    // name
    if (name != null && typeof name == "string") {
        const nameStr: string = name.toString()
        if (nameStr.length < 3) {
            return {
                error: "La longueur du nom doit être supérieure à 3 caractères"
            }
        } else data.name = nameStr
    } else {
        return {
            error: "Le nom n'est pas valide ou n'est pas du bon format"
        }
    }

    if (description != null && typeof description == "string") {
        const descriptionStr: string = description.toString()
        if (descriptionStr.length < 10) {
            return {
                error: "La longueur de la description doit être supérieure à 10 caractères"
            }
        } else data.desc = descriptionStr
    } else {
        return {
            error: "La description n'est pas valide ou n'est pas du bon format"
        }
    }

    if (picture != null && picture instanceof File) {
        // if there is a new file
        const pictureFile: File = picture
        if (pictureFile.size != 0 && pictureFile.size / (1024 * 1024) <= 10) {
            // valid picture file and size < 10mb
            // TODO : Some Logic to remove previous file from S3 and reupload another one

            // Remove Old Path if its possible
            if (previousPath != null && typeof previousPath == "string") {
                const res = await supabase.storage
                    .from("EventPictures")
                    .remove([previousPath.toString()])
            }

            // Upload new picture
            const response = await supabase.storage
                .from("EventPictures")
                .upload(data.name + ":" + randomUUID(), pictureFile)

            if (response.error) {
                // Upload Failed
                console.log(response.error)
                return {
                    error: "L'upload de l'image à échoué, veuillez réessayer"
                }
            } else {
                // Upload Success
                data.image = response.data.path
            }
        } else {
            // keep old picture
            if (previousPath != null && typeof previousPath == "string") {
                data.image = previousPath.toString()
            } else {
                return {
                    error: "L'image n'est pas valide ou la taille de l'image excède 10 mo"
                }
            }
        }
    } else {
        if (previousPath != null && typeof previousPath == "string") {
            data.image = previousPath.toString()
        } else {
            return {
                error: "L'image n'est pas valide ou n'est pas du bon format"
            }
        }
    }

    if (location != null && typeof location == "string") {
        if (location.length > 0) {
            // non null string
            data.location = location.toString()
        } else {
            return {
                error: "Lieu non-valide"
            }
        }
    } else {
        return {
            error: "Le lieu n'est pas valide ou n'est pas du bon format"
        }
    }

    if (category != null && typeof category == "string") {
        const categoryStr: string = category.toString()

        // check if the category exists
        try {
            // Retrives a single data record or return NonFoundError (code : 'P2025')
            const foundCategory = await prisma.category.findUniqueOrThrow({
                where: {
                    name: categoryStr
                }
            })

            data.categoryId = foundCategory.id
        } catch (error: any) {
            if (error.code === "P2025") {
                return {
                    error: `La catégorie ${categoryStr} n'existe pas`
                }
            } else {
                console.error(error)
                return {
                    error: "Une erreur à eu lieu lors de la récupération de la catégorie"
                }
            }
        }
    } else {
        return {
            error: "La catégorie n'est pas valide ou n'est pas du bon format"
        }
    }

    // Event Start Time
    if (
        startDate != null &&
        typeof startDate == "string" &&
        startHour != null &&
        startMinute != null
    ) {
        const startDateStr: string = startDate.toString()
        const startHourStr: string = startHour.toString()
        const startMinuteStr: string = startMinute.toString()
        if (isNaN(Number(startHourStr)) || isNaN(Number(startMinuteStr))) {
            return {
                error: "L'heure ou les minutes de départ ne sont pas sous le bon format"
            }
        }
        const parsedDate: Date = new Date(Date.parse(startDateStr))
        parsedDate.setHours(Number(startHourStr))
        parsedDate.setMinutes(Number(startMinuteStr))
        data.startTime = parsedDate
    } else {
        return {
            error: "La date ou l'heure de départ ne sont correctes"
        }
    }

    // Event End Time
    if (
        endDate != null &&
        typeof endDate == "string" &&
        endHour != null &&
        endMinute != null
    ) {
        const endDateStr: string = endDate.toString()
        const endHourStr: string = endHour.toString()
        const endMinuteStr: string = endMinute.toString()
        if (isNaN(Number(endHourStr)) || isNaN(Number(endMinuteStr))) {
            return {
                error: "L'heure ou les minutes de fin ne sont pas sous le bon format"
            }
        }
        const parsedDate: Date = new Date(Date.parse(endDateStr))
        parsedDate.setHours(Number(endHourStr))
        parsedDate.setMinutes(Number(endMinuteStr))
        data.endTime = parsedDate
    } else {
        return {
            error: "La date ou l'heure de fin ne sont pas correctes"
        }
    }

    if (visibility != null && typeof visibility == "string") {
        const visibilityStr: string = visibility.toString()
        switch (visibilityStr) {
            case "on":
                data.visibility = true
                break
            case "off":
                data.visibility = false
                break
            default:
                return {
                    error: "Wrong type of visibility"
                }
        }
    } else {
        data.visibility = false
    }

    // current user id
    const res = await getCurrentUserId()

    if (res.error) {
        return {
            error: "Echec de la récupération de l'utilisateur"
        }
    }

    // create event record in the DB
    try {
        const record = await prisma.event.update({
            where: {
                id: data.id
            },
            data: {
                name: data.name!,
                desc: data.desc!,
                categoryId: data.categoryId!,
                image: data.image,
                startTime: data.startTime,
                endTime: data.endTime,
                location: data.location!,
                creatorId: res.userId,
                visibility: data.visibility
            }
        })

        revalidatePath("/agenda")
        revalidatePath("/dashboard/events")
        return {
            success: true
        }
    } catch (error: any) {
        console.log(error)
        return {
            error: "La modification de l'évènement à échoué, veuillez réessayer"
        }
    }

    console.log(data)
}
