export async function verifyCaptcha(captchaValue: string) {
    const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY!}&response=${captchaValue}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    const data = await response.json();
    return data.success;
}
