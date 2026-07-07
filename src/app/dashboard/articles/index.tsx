import { Await, createFileRoute } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"

import ArticleList from "@/components/dashboard/Articles/articleList"
import CreateArticleButton from "@/components/dashboard/Articles/createArticleButton"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import { dashboardTitle } from "@/lib/seo"
import { tryCatch } from "@/lib/utils"

const getArticlePermissions = createServerFn().handler(async () => {
    const user = await getCurrentUserWithPermissions()
    return {
        canCreate: !!user && hasPermission(user, "create:article"),
        canEdit: !!user && hasPermission(user, "edit:article"),
        canDelete: !!user && hasPermission(user, "delete:article"),
        canPublish: !!user && hasPermission(user, "publish:article")
    }
})

const getArticles = createServerFn().handler(async () => {
    const articles = await tryCatch(
        prisma.article.findMany({
            orderBy: { writtenOn: "desc" }
        })
    )
    return articles.success ? articles.value : null
})

export const Route = createFileRoute("/dashboard/articles/")({
    loader: async () => ({
        permissions: await getArticlePermissions(),
        articles: getArticles()
    }),
    head: () => ({ meta: [{ title: dashboardTitle("Articles") }] }),
    component: Articles
})

function Articles() {
    const { permissions, articles } = Route.useLoaderData()
    const { canCreate, canEdit, canDelete, canPublish } = permissions

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                    Espace de gestion des articles
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Await promise={articles} fallback={<p>Chargements...</p>}>
                    {(articleList) => (
                        <ArticleList
                            articles={articleList}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            canPublish={canPublish}
                        />
                    )}
                </Await>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <CreateArticleButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
