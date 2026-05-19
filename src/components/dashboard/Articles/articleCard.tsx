"use client"

import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
// import EditArticleButton from "./editArticleButton";
import { startTransition, useActionState, useEffect, useState } from "react"
import { MdDelete, MdVisibility, MdVisibilityOff } from "react-icons/md"

import deleteArticleAction from "@/actions/articles/deleteArticleAction"
import switchVisibilityAction from "@/actions/articles/switchVisibilityAction"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import type { Article } from "@/generated/prisma/client"

import LoadingRing from "../loadingRing"
import EditArticleButton from "./editArticleButton"

interface ArticleCardProps {
    article: Article
    canEdit: boolean
    canDelete: boolean
    canPublish: boolean
}

export default function ArticleCard({
    article,
    canEdit,
    canDelete,
    canPublish
}: ArticleCardProps) {
    const { toast } = useToast()

    const [formState, formAction] = useActionState<
        { error?: string; success?: boolean } | undefined,
        number
    >(deleteArticleAction, undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSwitchingVisibility, setIsSwitchingVisibility] =
        useState<boolean>(false)

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        setIsLoading(true)

        startTransition(() => {
            formAction(article.id)
        })
    }

    useEffect(() => {
        if (formState?.success) {
            toast({
                description: `L'article ${article.title} a bien été supprimé`
            })
        } else if (formState?.error) {
            toast({
                title: "Erreur",
                variant: "destructive",
                description: formState?.error
            })
        }
        setIsLoading(false)
    }, [formState, article.title, toast])

    async function HandleVisibility() {
        setIsSwitchingVisibility(true)
        await switchVisibilityAction(article.id)
        setIsSwitchingVisibility(false)
    }

    return (
        <div className="bg-card text-card-foreground flex h-16 w-full flex-row items-center justify-between rounded-lg border px-4 py-4 shadow-xs">
            <Link
                href={`/actualites/articles/${article.id}`}
                title={article.title}
                className="overflow-hidden text-xs text-ellipsis whitespace-nowrap md:text-sm"
            >
                {article.title}
            </Link>
            <div className="text-card-foreground/70 hidden text-sm md:block">
                {format(article.writtenOn, "PPP", { locale: fr })}
            </div>

            <div id="buttons" className="flex flex-row items-center">
                {canPublish ? (
                    <Button
                        variant="default"
                        className="mr-2 hidden px-3 md:block"
                        onClick={HandleVisibility}
                        disabled={isSwitchingVisibility}
                    >
                        {isSwitchingVisibility ? (
                            <LoadingRing className="mr-0!" />
                        ) : article.published ? (
                            <MdVisibility size={17} title="publié" />
                        ) : (
                            <MdVisibilityOff size={17} title="draft" />
                        )}
                    </Button>
                ) : null}

                {canEdit ? <EditArticleButton article={article} /> : null}

                {canDelete ? (
                    <Button
                        variant="destructive"
                        className="px-2 py-2 sm:px-4"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? <LoadingRing /> : <MdDelete size={20} />}
                        <div className="hidden sm:flex">Supprimer</div>
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
