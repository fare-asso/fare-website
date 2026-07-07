"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import updateUserInfo from "@/actions/users/updateUserInfo"
import LoadingRing from "@/components/dashboard/loadingRing"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import type { Role, User } from "@/generated/prisma/client"

const schema = z.object({
    name: z.string().min(1, "Le nom d'utilisateur est requis").nullable(),
    email: z.string().email("Email invalide"),
    role: z.enum(["MEMBER", "ADMIN", "ASSO_OWNER"])
})

type SchemaType = z.infer<typeof schema>

const roleLabels: Record<Role, string> = {
    MEMBER: "Membre",
    ADMIN: "Membre Bureau FARE",
    ASSO_OWNER: "Admin Asso"
}

const roleWarnings: Record<string, string> = {
    "ADMIN->ASSO_OWNER":
        "Cet utilisateur perdra l'accès au dashboard et aura accès uniquement à l'espace association.",
    "ADMIN->MEMBER":
        "Cet utilisateur perdra l'accès au dashboard et n'aura plus d'accès spécial.",
    "ASSO_OWNER->ADMIN":
        "Cet utilisateur perdra l'accès à l'espace association et aura accès au dashboard.",
    "ASSO_OWNER->MEMBER":
        "Cet utilisateur perdra l'accès à l'espace association et n'aura plus d'accès spécial.",
    "MEMBER->ADMIN": "Cet utilisateur aura accès au dashboard administrateur.",
    "MEMBER->ASSO_OWNER": "Cet utilisateur aura accès à l'espace association."
}

export function UserInfoForm({ user }: { user: User }) {
    const userInfo = useMemo(
        () => ({
            name: user.name,
            email: user.email,
            role: user.role as "ADMIN" | "MEMBER" | "ASSO_OWNER"
        }),
        [user]
    )

    const [initialInfo, setInitialInfo] = useState(userInfo)
    const [showRoleWarning, setShowRoleWarning] = useState(false)
    const [pendingSubmitData, setPendingSubmitData] =
        useState<SchemaType | null>(null)

    const form = useForm<SchemaType>({
        resolver: zodResolver(schema),
        defaultValues: userInfo
    })

    useEffect(() => {
        form.reset(userInfo)
        setInitialInfo(userInfo)
    }, [form, userInfo])

    const currentValues = form.watch()
    const isChanged =
        JSON.stringify(currentValues) !== JSON.stringify(initialInfo)

    const getRoleWarning = (oldRole: Role, newRole: Role): string | null => {
        if (oldRole === newRole) return null
        const key = `${oldRole}->${newRole}`
        return roleWarnings[key] || null
    }

    const handleFormSubmit = async (data: SchemaType) => {
        const warning = getRoleWarning(initialInfo.role, data.role)
        if (warning) {
            setPendingSubmitData(data)
            setShowRoleWarning(true)
            return
        }
        await submitData(data)
    }

    const submitData = async (data: SchemaType) => {
        const res = await updateUserInfo(user.id, data)
        if (res.success) {
            form.reset(data)
            setInitialInfo(data)
        }
    }

    const confirmRoleChange = async () => {
        if (pendingSubmitData) {
            await submitData(pendingSubmitData)
            setPendingSubmitData(null)
        }
        setShowRoleWarning(false)
    }

    const cancelRoleChange = () => {
        setShowRoleWarning(false)
        setPendingSubmitData(null)
        // Reset the role to initial value
        form.setValue("role", initialInfo.role)
    }

    const currentWarning = pendingSubmitData
        ? getRoleWarning(initialInfo.role, pendingSubmitData.role)
        : null

    return (
        <>
            <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6 [&_label]:mb-2"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="id">ID</Label>
                        <Input id="id" defaultValue={user.id} disabled />
                    </div>
                    <div>
                        <Label htmlFor="firstName">Nom de l'utilisateur</Label>
                        <Input
                            id="firstName"
                            {...form.register("name")}
                            placeholder={user.name ? "" : "NULL"}
                        />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            {...form.register("email")}
                        />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">
                                {form.formState.errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={form.watch("role")}
                            onValueChange={(value) =>
                                form.setValue("role", value as Role)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MEMBER" disabled>
                                    Membre (non utilise)
                                </SelectItem>
                                <SelectItem value="ADMIN">
                                    Membre Bureau FARE
                                </SelectItem>
                                <SelectItem value="ASSO_OWNER">
                                    Admin Asso
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={!isChanged || form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting && <LoadingRing />}Enregistrer
                </Button>
            </form>

            <AlertDialog
                open={showRoleWarning}
                onOpenChange={setShowRoleWarning}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirmer le changement de role
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-2">
                                <p>
                                    Vous etes sur le point de changer le role de{" "}
                                    <strong>
                                        {roleLabels[initialInfo.role]}
                                    </strong>{" "}
                                    vers{" "}
                                    <strong>
                                        {pendingSubmitData
                                            ? roleLabels[pendingSubmitData.role]
                                            : ""}
                                    </strong>
                                    .
                                </p>
                                {currentWarning && (
                                    <p className="rounded-md bg-amber-100 p-3 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                                        {currentWarning}
                                    </p>
                                )}
                                <p>Voulez-vous continuer ?</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelRoleChange}>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRoleChange}>
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
