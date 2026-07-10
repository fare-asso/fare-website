import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"

import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { Article } from "@/generated/prisma/client"

import ArticleCard from "./articleCard"
import CreateArticleButton from "./createArticleButton"

interface ArticlesPageProps {
    user: ShellUser
    pathname: string
    initialData: Article[]
    canCreate: boolean
    canEdit: boolean
    canDelete: boolean
    canPublish: boolean
}

function ArticlesContent({
    initialData,
    canCreate,
    canEdit,
    canDelete,
    canPublish
}: Omit<ArticlesPageProps, "user" | "pathname">) {
    const { data: articles } = useQuery({
        queryKey: ["articles"],
        queryFn: async () => {
            const { data, error } = await actions.articles.listArticlesAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des articles.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                    Espace de gestion des articles
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <div className="bg-card text-card-foreground flex h-full w-full flex-col items-center space-y-4 overflow-y-auto rounded-lg border p-3 shadow-xs md:p-6">
                    {articles.length > 0 ? (
                        articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canPublish={canPublish}
                            />
                        ))
                    ) : (
                        <p>Aucun article trouvé</p>
                    )}
                </div>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <CreateArticleButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function ArticlesPage({
    user,
    pathname,
    ...rest
}: ArticlesPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <ArticlesContent {...rest} />
        </DashboardShell>
    )
}
