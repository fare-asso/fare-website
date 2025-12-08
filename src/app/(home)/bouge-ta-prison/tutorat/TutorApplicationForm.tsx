"use client"

import submitTutorApplication from "@/actions/bouge-ta-prison/submitTutorApplication"
import Captcha from "@/components/captcha/recaptcha"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    BTPTutorApplication,
    BTPTutorApplicationSchema
} from "@/schemas/bougeTaPrison"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"

export default function TutorApplicationForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState<boolean | undefined>(undefined)

    const form = useForm<BTPTutorApplication>({
        resolver: zodResolver(BTPTutorApplicationSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            major: "",
            studyYear: "L3",
            cv: undefined,
            motivationLetter: undefined
        }
    })

    const onSubmit = async (data: BTPTutorApplication) => {
        // Do something with the data...
        setIsLoading(true)

        const formData = new FormData()

        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value)
        })

        const res = await submitTutorApplication(formData)

        if (!res.success) {
            res.errors?.forEach((error) => {
                form.setError(
                    Object.keys(error)[0] as keyof BTPTutorApplication,
                    {
                        message: Object.values(error)[0]
                    }
                )
            })
        }
        setSuccess(res.success)
        form.reset()
        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <h2>Formulaire de candidature</h2>
                <p className="text-sm">
                    Pour candidater, veuillez remplir le formulaire ci-dessous.
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            name="firstName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Jean" {...field} />
                                    </FormControl>
                                    <FormMessage>
                                        {
                                            form.formState.errors.firstName
                                                ?.message
                                        }
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="lastName"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Martin"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {
                                            form.formState.errors.lastName
                                                ?.message
                                        }
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="jean.martin@example.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {form.formState.errors.email?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="major"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Filière</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Droit, Psychologie, etc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Votre filière d'études actuelle
                                    </FormDescription>
                                    <FormMessage>
                                        {form.formState.errors.major?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="studyYear"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Année d'étude</FormLabel>
                                    <FormControl>
                                        <Select>
                                            <FormControl>
                                                <SelectTrigger className="w-full md:w-1/2">
                                                    <SelectValue placeholder="Veuillez selectionner une année d'étude" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="L3">
                                                    Licence 3
                                                </SelectItem>
                                                <SelectItem value="M1">
                                                    M1
                                                </SelectItem>
                                                <SelectItem value="M2">
                                                    M2
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Votre année d'étude prévue pour
                                        2025-2026
                                    </FormDescription>
                                    <FormMessage>
                                        {
                                            form.formState.errors.studyYear
                                                ?.message
                                        }
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="cv"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CV</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.files?.[0]
                                                )
                                            }
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            className="w-full md:w-1/2"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Votre CV au format PDF (max 5 Mo)
                                    </FormDescription>
                                    <FormMessage>
                                        {form.formState.errors.cv?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="motivationLetter"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lettre de motivation</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.files?.[0]
                                                )
                                            }
                                            onBlur={field.onBlur}
                                            name={field.name}
                                            ref={field.ref}
                                            className="w-full md:w-1/2"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Votre lettre de motivation au format PDF
                                        (max 5 Mo)
                                    </FormDescription>
                                    <FormMessage>
                                        {
                                            form.formState.errors
                                                .motivationLetter?.message
                                        }
                                    </FormMessage>
                                </FormItem>
                            )}
                        />
                        <Captcha onChange={() => console.log("Captcha")} />
                        <Button
                            type="submit"
                            variant="default"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingRing /> : null}
                            Soumettre
                        </Button>
                    </form>
                </Form>

                {success === true ? (
                    <Alert
                        variant="default"
                        className="mt-4 flex flex-row items-center border-green-500 bg-green-100 text-green-900"
                    >
                        <span>
                            Votre candidature a bien été soumise. Merci pour
                            votre intérêt!
                        </span>
                    </Alert>
                ) : null}
                {success === false ? (
                    <Alert
                        variant="destructive"
                        className="mt-4 flex flex-row items-center"
                    >
                        <span>
                            Une erreur est survenue lors de la soumission de la
                            candidature. Veuillez réessayer.
                        </span>
                    </Alert>
                ) : null}
            </CardContent>
        </Card>
    )
}
