"use server";

import prisma from "@/helpers/db";

export default async function createEventAction(formData: FormData) {

    const name = formData.get("name");
    const description = formData.get('description')
    const picture = formData.get('picture')

    const startTime: string = formData.get("startHours")!.toString() + " : " + formData.get("startMinutes")!.toString();

    console.log('Name: ' + name)
    console.log('Description: ' + description)
    console.log('Picture: ' + picture)
    
    console.log('Heure début: ' + startTime)
    

}