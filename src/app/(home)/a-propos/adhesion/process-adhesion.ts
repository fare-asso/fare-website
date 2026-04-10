"use server"

import type { AdhesionForm } from "./form-schema"

export async function processAdhesion(
    data: AdhesionForm
): Promise<{ success: true } | { success: false; message: string }> {
    console.log("Processing adhesion", data)

    return {
        success: true
    }
}
