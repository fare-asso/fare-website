"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import LoadingRing from "@/components/dashboard/loadingRing";
import updateUserInfo from "@/actions/users/updateUserInfo";
import { Role, User } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const schema = z.object({
    name: z.string().min(1, "Le nom d'utilisateur est requis").nullable(),
    email: z.string().email("Email invalide"),
    role: z.enum(["MEMBER", "ADMIN", "ASSO_OWNER"]),
});

type SchemaType = z.infer<typeof schema>;

export function UserInfoForm({ user }: { user: User }) {
    const userInfo = useMemo(
        () => ({
            name: user.name,
            email: user.email,
            role: user.role as "ADMIN" | "MEMBER" | "ASSO_OWNER",
        }),
        [user],
    );

    const [initialInfo, setInitialInfo] = useState(userInfo);

    const form = useForm<SchemaType>({
        resolver: zodResolver(schema),
        defaultValues: userInfo,
    });

    useEffect(() => {
        form.reset(userInfo);
        setInitialInfo(userInfo);
    }, [userInfo]);

    const currentValues = form.watch();
    const isChanged =
        JSON.stringify(currentValues) !== JSON.stringify(initialInfo);

    const onSubmit = async (data: SchemaType) => {
        const res = await updateUserInfo(user.id, data);
        if (res.success) {
            form.reset(data);
            setInitialInfo(data);
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                    <Label htmlFor="role">Rôle</Label>
                    <Select
                        value={form.watch("role")}
                        onValueChange={(value) =>
                            form.setValue("role", value as Role)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choisir un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="MEMBER" disabled>
                                Membre (non utilisé)
                            </SelectItem>
                            <SelectItem value="ADMIN">Admin Site BF</SelectItem>
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
    );
}
