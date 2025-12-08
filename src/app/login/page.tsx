"use client"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import { MdAdminPanelSettings } from "react-icons/md"

import LoginForm from "@/components/dashboard/loginForm"
import Image from "next/image"

import FARELogo from "/public/logo_fare.png"

export default function LoginPage() {
    return (
        <Card className="mx-auto mt-20 max-w-sm min-w-1/3">
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
