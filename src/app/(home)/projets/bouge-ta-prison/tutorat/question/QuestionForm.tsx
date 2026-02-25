"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { memo, useState } from "react"
import { useForm } from "react-hook-form"
import submitTutorQuestion from "@/actions/bouge-ta-prison/submitTutorQuestion"
import { Captcha } from "@/components/captcha"
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
import { Textarea } from "@/components/ui/textarea"
import {
    type BTPTutorQuestion,
    BTPTutorQuestionSchema
} from "@/schemas/bougeTaPrison"

const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: {
    onTokenChange: (token: string) => void
}) {
    return <Captcha onComplete={onTokenChange} />
})

export default function QuestionForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState<boolean | undefined>(undefined)

    const form = useForm<BTPTutorQuestion>({
        resolver: zodResolver(BTPTutorQuestionSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            major: "",
            studyYear: "L3",
            message: "",
            captchaToken: ""
        }
    })

    const onSubmit = async (data: BTPTutorQuestion) => {
        setIsLoading(true)
        const res = await submitTutorQuestion(data)

        if (!res.success && res.errors) {
            for (const error of res.errors) {
                form.setError(Object.keys(error)[0] as keyof BTPTutorQuestion, {
                    message: Object.values(error)[0]
                })
            }
        }
        setSuccess(res.success)
        form.reset()
        setIsLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <h2>Vous avez une question sur le tutorat Bouge Ta Prison ?</h2>
                <p className="text-sm">
                    Si vous avez des questions concernant le tutorat Bouge Ta
                    Prison, n'hésitez pas à nous les poser en remplissant le
                    formulaire ci-dessous. Nous vous répondrons dans les plus
                    brefs délais.
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
                                                    <SelectValue
                                                        placeholder="Veuillez selectionner une année d'étude"
                                                        {...field}
                                                    />
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
                                                <SelectItem value="other">
                                                    Autres
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Votre année d'étude prévue pour
                                        2026-2027
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
                            name="message"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Vous pouvez écrire votre message ici."
                                            className="h-32 max-h-52"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {form.formState.errors.message?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        <FormField
                            name="captchaToken"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vérification CAPTCHA</FormLabel>
                                    <FormControl>
                                        <CaptchaWidget
                                            onTokenChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {
                                            form.formState.errors.captchaToken
                                                ?.message
                                        }
                                    </FormMessage>
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            variant="default"
                            disabled={isLoading}
                        >
                            {isLoading ? <LoadingRing /> : null}
                            Envoyer
                        </Button>
                    </form>
                </Form>

                {success === true ? (
                    <Alert
                        variant="default"
                        className="mt-4 flex flex-row items-center border-green-500 bg-green-100 text-green-900"
                    >
                        <span>
                            Votre question a bien été envoyée. Merci pour votre
                            intérêt!
                        </span>
                    </Alert>
                ) : null}
                {success === false ? (
                    <Alert
                        variant="destructive"
                        className="mt-4 flex flex-row items-center"
                    >
                        <span>
                            Une erreur est survenue lors de l'envoi de votre
                            question. Veuillez réessayer.
                        </span>
                    </Alert>
                ) : null}
            </CardContent>
        </Card>
    )
}
