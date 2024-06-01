"use server";

import prisma from "@/helpers/db";
import { revalidatePath } from "next/cache";

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

    const data: Event = {}

    /* Data validation */

    // name
    if(name != null && typeof name == 'string') {
        const nameStr: string = name.toString();
        if(nameStr.length < 3) {
            return {
                error: "La longueur du nom doit être supérieure à 3 caractères"
            }
        } else data.name = nameStr;
    }

    if(description != null && typeof description == 'string') {
        const descriptionStr: string = description.toString();
        if(descriptionStr.length < 10) {
            return {
                error: "La longueur de la description doit être supérieure à 10 caractères"
            }
        } else data.desc = descriptionStr;
    }

    if(picture != null && picture instanceof File) {
        const pictureFile: File = picture;
        if(pictureFile.size != 0 && ((pictureFile.size / (1024*1024)) <= 10)) { // valid picture file and size < 10mb
            // TODO : Some Logic to upload file to S3 and to generate a permanent link
            
        } else {
            return {
                error: "L'image n'est pas valide ou la taille de l'image excède 10 mo"
            }
        }
    }

    if(location != null && typeof location == 'string') {
        if(location.length > 0) { // non null string
            data.location = location.toString();
        } else {
            return {
                error: "Lieu non-valide"
            }
        }
    }

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
    }

    // create event record in the DB
    try {
        const record = await prisma.event.create({
            data : {
                name: data.name!,
                desc: data.desc!,
                categoryId: data.categoryId!,
                image: "",
                startTime: data.startTime,
                endTime: data.endTime,
                location: data.location!,
                creatorId: 1,
                visibility: data.visibility
            }
        })

        revalidatePath('/dashboard/events')
        return {
            success: true
        }

        
    } catch (error: any) {
        return {
            error : "La création de l'évènement à échoué, veuillez réessayer"
        }
    }
    

    console.log(data);


        
}