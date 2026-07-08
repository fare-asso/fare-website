import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useTransition } from "react"
import { MdDelete, MdVisibility, MdVisibilityOff } from "react-icons/md"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
    const queryClient = useQueryClient()
    const [isDeleting, startDelete] = useTransition()
    const [isSwitchingVisibility, startVisibility] = useTransition()

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        startDelete(async () => {
            const { data, error } =
                await actions.articles.deleteArticleAction(article.id)
            if (error || !data.success) {
                toast.error(
                    data?.error ?? "Une erreur est survenue. Veuillez réessayer."
                )
            } else {
                toast.success(`L'article ${article.title} a bien été supprimé`)
            }
            await queryClient.invalidateQueries({ queryKey: ["articles"] })
        })
    }

    const handleVisibility = () => {
        startVisibility(async () => {
            const { data, error } =
                await actions.articles.switchVisibilityAction(article.id)
            if (error || data.error) {
                toast.error(data?.error ?? "Échec du changement de visibilité")
            }
            await queryClient.invalidateQueries({ queryKey: ["articles"] })
        })
    }

    return (
        <div className="bg-card text-card-foreground flex h-16 w-full flex-row items-center justify-between rounded-lg border px-4 py-4 shadow-xs">
            <a
                href={`/actualites/articles/${article.id}`}
                title={article.title}
                className="overflow-hidden text-xs text-ellipsis whitespace-nowrap md:text-sm"
            >
                {article.title}
            </a>
            <div className="text-card-foreground/70 hidden text-sm md:block">
                {format(article.writtenOn, "PPP", { locale: fr })}
            </div>

            <div id="buttons" className="flex flex-row items-center">
                {canPublish ? (
                    <Button
                        variant="default"
                        className="mr-2 hidden px-3 md:block"
                        onClick={handleVisibility}
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
                        disabled={isDeleting}
                    >
                        {isDeleting ? <LoadingRing /> : <MdDelete size={20} />}
                        <div className="hidden sm:flex">Supprimer</div>
                    </Button>
                ) : null}
            </div>
        </div>
    )
}
