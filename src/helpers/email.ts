import nodemailer from "nodemailer";

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

// Configuration du transporteur
const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || "Gmail",
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_APP_PASS,
    },
});

export async function sendEmail(
    payload: EmailPayload,
): Promise<{ error?: string; success?: boolean }> {
    const { to, subject, html } = payload;

    try {
        const response = await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,
            to,
            subject,
            html,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error sendEmail: ", error);
        return { success: false, error: error.message };
    }
}
