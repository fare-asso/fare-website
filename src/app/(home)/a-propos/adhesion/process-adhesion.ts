"use server"

import { type } from "arktype"
import { AdhesionFormSchema, type TAdhesionForm } from "./form-schema"

export async function processAdhesion(
    formData: TAdhesionForm
): Promise<{ success: true } | { success: false; message: string }> {
    console.log("Processing adhesion", formData)

    const data = AdhesionFormSchema(formData)

    // just so linting passes while we write this
    await new Promise((resolve) => setTimeout(resolve, 0))

    if (data instanceof type.errors) {
        return {
            success: false,
            message: data.summary
        }
    }

    // process the form, save data to db, save image and files to supabase storage

    return {
        success: true
    }
}
