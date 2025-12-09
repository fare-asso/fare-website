"use client"

import Image from "next/image"
import { MdAdminPanelSettings } from "react-icons/md"
import FARELogo from "#public/logo_fare.png"
import LoginForm from "@/components/dashboard/loginForm"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

export default function LoginPage() {
    return (
        <Card className="mx-auto mt-20 min-w-1/3 max-w-sm">
            <CardHeader className="flex flex-col items-start">
                <Image
                    src={FARELogo}
                    alt="Logo de la FARE"
                    className="mx-auto mb-6 w-1/5 text-center"
                />
                <CardTitle className="flex items-center gap-1">
                    <MdAdminPanelSettings size={25} />
                    <span>Connexion Admin</span>
                </CardTitle>
                <CardDescription>
                    Accès réservé uniquement aux membres de la fédération
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm></LoginForm>
            </CardContent>
        </Card>
    )
}
