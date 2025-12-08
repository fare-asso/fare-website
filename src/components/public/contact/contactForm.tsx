"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import clsx from "clsx"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { RiCheckFill } from "react-icons/ri"
import submitContactFormAction from "@/actions/contact/submitContactFormAction"
import LoadingRing from "@/components/dashboard/loadingRing"
import { type Contact, ContactSchema } from "@/schemas/contact"
import Input from "./input"
import TextArea from "./textarea"

export default function ContactForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)

    const form = useForm<Contact>({
        resolver: zodResolver(ContactSchema)
    })

    const getFirstError = () => {
        const firstError = Object.entries(form.formState.errors)[0]
        return firstError ? firstError[1].message : null
    }

    const onSubmit = async (data: Contact) => {
        setIsLoading(true)

        const res = await submitContactFormAction(data)

        res.errors?.forEach(({ message, field }) => {
            form.setError(field as keyof Contact, { type: "manual", message })
        })

        if (res.success) {
            setIsLoading(false)
            setSuccess(true)
            form.reset()
        }
    }

    return (
        <div className="mt-12 flex w-full flex-col rounded-3xl bg-black p-4 md:w-[70%] md:flex-row md:p-8">
            {/* Text Section */}
            <div className="mb-6 flex w-full flex-col justify-center pr-0 md:mb-0 md:w-1/2 md:pr-8">
                <h2 className="mb-4 font-semibold text-2xl text-white">
                    Vous avez une question ?
                </h2>
                <p className="text-gray-300">
                    N'hésitez pas à nous contacter. Notre équipe se fera un
                    plaisir de vous répondre dans les plus brefs délais.
                </p>
            </div>

            {/* Form Section */}
            <form
                className="flex w-full flex-col space-y-4 text-white md:w-1/2"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* First name + Last name */}
                <div className="flex w-full flex-col gap-4 sm:flex-row">
                    <Input
                        {...form.register("firstName")}
                        error={form.formState.errors.firstName}
                        type="text"
                        placeholder="Prénom"
                        className="w-full flex-1 rounded-xl bg-[#202124] px-4 py-3 text-center focus:outline-hidden focus:ring-2 focus:ring-white/20"
                    />
                    <Input
                        {...form.register("lastName")}
                        error={form.formState.errors.lastName}
                        type="text"
                        placeholder="Nom"
                        className="w-full flex-1 rounded-xl bg-[#202124] px-4 py-3 text-center focus:outline-hidden focus:ring-2 focus:ring-white/20"
                    />
                </div>

                {/* Email address */}
                <Input
                    {...form.register("email")}
                    error={form.formState.errors.email}
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-xl bg-[#202124] px-4 py-3 text-center focus:outline-hidden focus:ring-2 focus:ring-white/20"
                />

                {/* Message */}
                <TextArea
                    {...form.register("message")}
                    error={form.formState.errors.message}
                    placeholder="Entrez votre message ici"
                    className="h-32 w-full resize-none rounded-xl bg-[#202124] px-4 py-3 text-center focus:outline-hidden focus:ring-2 focus:ring-white/20"
                ></TextArea>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading || success}
                    className={clsx(
                        "flex w-full flex-row items-center justify-center rounded-full bg-white/20 py-3 text-gray-200 text-lg transition-colors duration-200 hover:bg-white/30",
                        getFirstError() &&
                            "cursor-not-allowed bg-red-500! hover:bg-red-500",
                        success &&
                            "cursor-default bg-green-500! hover:bg-green-500",
                        isLoading && "cursor-wait"
                    )}
                >
                    {getFirstError() ??
                        (isLoading ? (
                            <LoadingRing className="size-[28px]!" />
                        ) : success ? (
                            <div className="flex flex-row items-center justify-center">
                                <RiCheckFill size={25} className="mr-1" />{" "}
                                Demande envoyée
                            </div>
                        ) : (
                            "Envoyer"
                        ))}
                </button>
            </form>
        </div>
    )
}
