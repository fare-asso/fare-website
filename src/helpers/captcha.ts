
export async function verifyCaptcha(captchaValue: string) {
    const response = await fetch(
        `https://www.google.com/recaptcha/api/siteverify?secret=6LfNcTYqAAAAAI_3A1XCfBPmkHmOLrzBnwW51zFS&response=${captchaValue}`,
        {
        method: 'POST',
        headers: {
            'Content-Type': "application/json",
        }
        }
    );

    const data = await response.json();
    return data.success;
}