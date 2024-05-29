'use server';

import { redirect } from "next/navigation";


export default async function loginAction(currentState: {usernameError : string | undefined, passwordError: string | undefined},  formData: FormData) {

    const username = formData.get('username');
    const password = formData.get('password');

    console.log("Username: " + username)
    console.log("Password: " + password)

    // TODO: Auth validation for admins

    if(username === "blasster35@gmail.com") {
        redirect("../dashboard")
    }
    else {
        return {
            usernameError: "wrong username",
            passwordError: ""
        }
    }

    

}