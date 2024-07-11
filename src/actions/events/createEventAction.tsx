"use server";

import prisma from "@/helpers/db";
import { revalidatePath } from "next/cache";
import { createClient } from "@/helpers/supabase/server";
import { randomUUID } from "crypto";
import getCurrentUserId from "@/helpers/user/id";

import { sanitizeString } from "@/helpers/string";

interface Event {
    name?: string,
    desc?: string,
    image?: string,
    startTime?: Date,
    endTime?: Date,
    location?: string,
    categoryId?: number,
    creatorId?: number,
    visibility?: boolean
}

export default async function createEventAction(prevState: {error? : string, success? : boolean} | undefined, formData: FormData) {

    // instantiate supabase client
    const supabase = createClient();

    // retrieve form data fields
    const name = formData.get('name'); 
    const description = formData.get('description');
    const picture = formData.get('picture');
    const location = formData.get('location');
    const category = formData.get('category');

    const startDate = formData.get('startDate');
    const startHour = formData.get('startHour');
    const startMinute = formData.get('startMinute');

    const endDate = formData.get('endDate');
    const endHour = formData.get('endHour');
    const endMinute = formData.get('endMinute');

    const visibility = formData.get('visibility');

    // create a temp variable to gradually store each data after their validation
    const data: Event = {}



    /* Data Validation */

    // check name validity
    if(name != null && typeof name == 'string') {
        const nameStr: string = name.toString();
        if(nameStr.length < 3) {
            return {
                error: "La longueur du nom doit être supérieure à 3 caractères"
            }
        } else data.name = nameStr;
    } else {
        return {
            error : "Le nom n'est pas valide ou n'est pas du bon format"
        }
    }

    // check description validity
    if(description != null && typeof description == 'string') {
        const descriptionStr: string = description.toString();
        if(descriptionStr.length < 10) {
            return {
                error: "La longueur de la description doit être supérieure à 10 caractères"
            }
        } else data.desc = descriptionStr;
    } else {
        return {
            error : "La description n'est pas valide ou n'est pas du bon format"
        }
    }

    // check location validity
    if(location != null && typeof location == 'string') {
        if(location.length > 0) { // non null string
            
            // location is a stringified JSON
            data.location = location.toString();
        } else {
            return {
                error: "Lieu non-valide"
            }
        }
    } else {
        return {
            error : "Le lieu n'est pas valide ou n'est pas du bon format"
        }
    }

    // check category validity
    if(category != null && typeof category == 'string') {

        const categoryStr: string = category.toString();

        // check if the category exists
        try {

             // Retrives a single data record or return NonFoundError (code : 'P2025')
            const foundCategory = await prisma.category.findUniqueOrThrow({
                where: {
                    name: categoryStr
                }
            })

            data.categoryId = foundCategory.id;

        } catch (error: any) {
            if(error.code === 'P2025') {
                return {
                    error: `La catégorie ${categoryStr} n'existe pas`
                }
            } else {
                console.error(error);
                return {
                    error: 'Une erreur à eu lieu lors de la récupération de la catégorie'
                }
            }
            
        }
        
    } else {
        return {
            error : "La catégorie n'est pas valide ou n'est pas du bon format"
        }
    }

    // Event Start Time
    if(startDate != null && typeof startDate == 'string' && startHour != null && startMinute != null) {
        const startDateStr : string = startDate.toString();
        const startHourStr : string = startHour.toString();
        const startMinuteStr: string = startMinute.toString();
        if(isNaN(Number(startHourStr)) || isNaN(Number(startMinuteStr))) {
            return {
                error: "L'heure ou les minutes de départ ne sont pas sous le bon format"
            }
        }
        const parsedDate : Date = new Date(Date.parse(startDateStr));
        parsedDate.setHours(Number(startHourStr));
        parsedDate.setMinutes(Number(startMinuteStr));
        data.startTime = parsedDate;
    } else {
        return {
            error: "La date ou l'heure de départ ne sont correctes"
        }
    }

    // Event End Time
    if(endDate != null && typeof endDate == 'string' && endHour != null && endMinute != null) {
        const endDateStr : string = endDate.toString();
        const endHourStr : string = endHour.toString();
        const endMinuteStr: string = endMinute.toString();
        if(isNaN(Number(endHourStr)) || isNaN(Number(endMinuteStr))) {
            return {
                error: "L'heure ou les minutes de fin ne sont pas sous le bon format"
            }
        }
        const parsedDate : Date = new Date(Date.parse(endDateStr));
        parsedDate.setHours(Number(endHourStr));
        parsedDate.setMinutes(Number(endMinuteStr));
        data.endTime = parsedDate;

    } else {
        return {
            error: "La date ou l'heure de fin ne sont pas correctes"
        }
    }

    // check visibility validity
    if(visibility != null && typeof visibility == 'string') {
        const visibilityStr : string = visibility.toString();
        switch (visibilityStr) {
            case 'on': 
                data.visibility = true;
                break;
            case 'off':
                data.visibility = false;
                break;
            default: return {
                error: "Wrong type of visibility"
            }
        }
    } else {
        // false if null
        data.visibility = false;
    }

    // check picture validity and size
    if(picture != null && picture instanceof File) {
        const pictureFile: File = picture;
        if(pictureFile.size != 0 && ((pictureFile.size / (1024*1024)) <= 10)) { // valid picture file and size < 10mb
            // Some Logic to upload file to S3 and get its path
            const res = await supabase.storage.from('EventPictures').upload(sanitizeString(data.name) + ":" + randomUUID(), pictureFile);

            if(res.error) { // Upload Failed
                console.log(res.error)
                return {
                    error : "L'upload de l'image à échoué, veuillez réessayer"
                }
            } else { // Upload Success
                data.image = res.data.path;
            }
            
        } else {
            return {
                error: "L'image n'est pas valide ou la taille de l'image excède 10 mo"
            }
        }
    } else {
        return {
            error : "L'image n'est pas valide ou n'est pas du bon format"
        }
    }

    // fetch current user id
    const res = await getCurrentUserId();

    if(res.error) {
        return {
            error : "res.error"
        }
    }

    // create event record in the DB
    try {
        const record = await prisma.event.create({
            data : {
                name: data.name!,
                desc: data.desc!,
                categoryId: data.categoryId!,
                image: data.image,
                startTime: data.startTime,
                endTime: data.endTime,
                location: data.location!,
                creatorId: res.userId!,
                visibility: data.visibility
            }
        })

        revalidatePath('/agenda')
        revalidatePath('/dashboard/events')
        return {
            success: true
        }

        
    } catch (error: any) {
        const res = await supabase.storage.from('EventPictures').remove([data.image])
        if(res.error) {
            console.error('Failed to delete the previously uploaded picture on the storage')
        }
        
        return {
            error : "La création de l'évènement à échoué, veuillez réessayer"
        }
    }
       
}