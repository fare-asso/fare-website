"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Input from "./input";
import clsx from "clsx";
import TextArea from "./textarea";
import { Contact, ContactSchema } from "@/schemas/contact";
import { useState } from "react";
import LoadingRing from "@/components/dashboard/loadingRing";
import submitContactFormAction from "@/actions/contact/submitContactFormAction";

export default function ContactForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    const form = useForm<Contact>({
        resolver: zodResolver(ContactSchema),
    });

    const getFirstError = () => {
        const firstError = Object.entries(form.formState.errors)[0];
        return firstError ? firstError[1].message : null;
    };

    const onSubmit = async (data: Contact) => {
        setIsLoading(true);

        const res = await submitContactFormAction(data);

        res.errors?.forEach(({ message, field }) => {
            form.setError(field as keyof Contact, { type: "manual", message });
        });

        if (res.success) {
            setIsLoading(false);
            setSuccess(true);
            form.reset();
        }
    };

    return (
        <div className="flex flex-col md:flex-row w-full md:w-[70%] bg-black mt-12 p-4 md:p-8 rounded-3xl">
            {/* Text Section */}
            <div className="flex flex-col justify-center w-full md:w-1/2 pr-0 md:pr-8 mb-6 md:mb-0">
                <h2 className="text-2xl text-white font-semibold mb-4">
                    Vous avez une question ?
                </h2>
                <p className="text-gray-300">
                    N'hésitez pas à nous contacter. Notre équipe se fera un
                    plaisir de vous répondre dans les plus brefs délais.
                </p>
            </div>

            {/* Form Section */}
            <form
                className="flex flex-col w-full md:w-1/2 space-y-4 text-white"
                onSubmit={form.handleSubmit(onSubmit)}
            >
                {/* First name + Last name */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Input
                        {...form.register("firstName")}
                        error={form.formState.errors.firstName}
                        type="text"
                        placeholder="Prénom"
                        className="flex-1 text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 w-full"
                    />
                    <Input
                        {...form.register("lastName")}
                        error={form.formState.errors.lastName}
                        type="text"
                        placeholder="Nom"
                        className="flex-1 text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 w-full"
                    />
                </div>

                {/* Email address */}
                <Input
                    {...form.register("email")}
                    error={form.formState.errors.email}
                    type="email"
                    placeholder="Email"
                    className="w-full text-center bg-[#202124] py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20"
                />

                {/* Message */}
                <TextArea
                    {...form.register("message")}
                    error={form.formState.errors.message}
                    placeholder="Entrez votre message ici"
                    className="w-full text-center bg-[#202124] py-3 px-4 rounded-xl h-32 resize-none focus:outline-none focus:ring-2 focus:ring-white/20"
                ></TextArea>

                {/* Submit button */}
                <button
                    type="submit"
                    disabled={isLoading || success}
                    className={clsx(
                        "w-full flex flex-row items-center justify-center rounded-full bg-white/20 py-3 text-lg text-gray-200 hover:bg-white/30 transition-colors duration-200",
                        getFirstError() &&
                            "!bg-red-500 hover:bg-red-500 cursor-not-allowed",
                        success &&
                            "!bg-green-500 hover:bg-green-500 cursor-default",
                        isLoading && "cursor-wait",
                    )}
                >
                    {getFirstError() ??
                        (isLoading ? (
                            <LoadingRing className="!size-[28px]" />
                        ) : success ? (
                            "Demande envoyée"
                        ) : (
                            "Envoyer"
                        ))}
                </button>
            </form>
        </div>
    );
}
