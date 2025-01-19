"use server";

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.GMAIL_NOTIF_USER, // Gmail user
        pass: process.env.GMAIL_NOTIF_PASS, // Gmail password
    },
});

export default async function sendEmailAction(
    email: string,
    subject: string,
    message: string,
) {
    try {
        await transporter.sendMail({
            from: `"FAHB Notifications" <${process.env.GMAIL_NOTIF_USER}>`, // Sender address + name
            to: email,
            subject: subject,
            text: message,
            // Optionnaly send an HTML version of the message
            html: message.replace(/\n/g, "<br>"), // Convert newlines to <br> tags
        });

        return { success: true };
    } catch (error: any) {
        console.error("Erreur d'envoi email:", error);
        return { success: false, error: error.message };
    }
}
