'use server';

import { verifyCaptcha } from "@/helpers/captcha";
import prisma from "@/helpers/db";

export default async function bugReportAction(prevState: {error?: string, success?: boolean} | undefined, formData: FormData) {

    // Retrieve CAPTCHA value
    const captchaValue = formData.get('g-recaptcha-response')?.toString();

    // Verify CAPTCHA
    if (!captchaValue) {
        return { error: "Veuillez compléter le CAPTCHA." };
    }

    const isCaptchaValid = await verifyCaptcha(captchaValue);
    if (!isCaptchaValid) {
        return { error: "La vérification CAPTCHA a échoué. Veuillez réessayer." };
    }

    // retrieve form data fields
    const email = formData.get('email')?.toString();
    const bugType = formData.get('bug-type')?.toString();
    const description = formData.get('description')?.toString();


    // data validation
    if(!email || !bugType || !description) {
        return { error: "Un ou plusieurs champs ne sont pas remplis." }
    }

    try {
        const createdRecord = await prisma.bugReport.create({
            data: {
                email,
                type: bugType,
                description
            }
        })

        return { success: true }
        
    } catch (e) {
        console.error(e);
        return { error : "Echec de l'envoi du rapport... Veuillez réessayer plus tard!" }
    }

}