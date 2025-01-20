"use client";

import { DeltaStatic, Sources } from "quill";

import { fr } from "date-fns/locale";
import { format } from "date-fns";

import { Article } from "./articleList";

import { Button } from "@/components/ui/button";

import { MdDelete, MdVisibility } from "react-icons/md";
import { MdEdit } from "react-icons/md";

import EditArticleButton from "./editArticleButton";

import deleteArticleAction from "@/actions/articles/deleteArticleAction";

import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import LoadingRing from "../loadingRing";
import Link from "next/link";

export default function ArticleCard({ article }: { article: Article }) {
    const { toast } = useToast();

    const [formState, formAction] = useFormState<
        { error?: string; success?: boolean } | undefined,
        number
    >(deleteArticleAction, undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsLoading(true);

        formAction(article.id);
    };

    useEffect(() => {
        if (formState?.success) {
            toast({
                description: `L'article ${article.title} a bien été supprimé`,
            });
        } else if (formState?.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: formState?.error,
            });
        }
        setIsLoading(false);
    });

    return (
        <div className="w-full rounded-lg border bg-card text-card-foreground shadow-sm px-4 py-4 h-16 flex flex-row items-center justify-between">
            <div className="text-xs md:text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                {article.title}
            </div>
            <div className="text-sm text-card-foreground/70 hidden md:block">
                {format(article.writtenOn, "PPP", { locale: fr })}
            </div>

            <div id="buttons" className="flex flex-row items-center">
                <Button
                    variant={"default"}
                    className="px-3 mr-2 hidden md:block"
                >
                    <Link
                        href={`/actualites/articles/${article.id}`}
                        className=""
                    >
                        <MdVisibility size={17} />
                    </Link>
                </Button>

                <EditArticleButton
                    className="mr-2 px-2 py-2 sm:px-4"
                    article={article}
                >
                    <MdEdit size={20} className="mr-0 sm:mr-1" />
                    <div className="hidden sm:flex">Modifier</div>
                </EditArticleButton>
                <Button
                    variant="destructive"
                    className="px-2 py-2 sm:px-4"
                    onClick={handleDelete}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <LoadingRing />
                    ) : (
                        <MdDelete size={20} className="mr-0 sm:mr-1" />
                    )}
                    <div className="hidden sm:flex">Supprimer</div>
                </Button>
            </div>
        </div>
    );
}
