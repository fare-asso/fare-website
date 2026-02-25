import type { Metadata } from "next"
import { Suspense } from "react"
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
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth"

export const metadata: Metadata = {
    title: "Articles"
}

export default async function Articles() {
    const user = await getCurrentUserWithPermissions()
    const canCreate = !!user && hasPermission(user, "create:article")
    const canEdit = !!user && hasPermission(user, "edit:article")
    const canDelete = !!user && hasPermission(user, "delete:article")
    const canPublish = !!user && hasPermission(user, "publish:article")

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Articles</CardTitle>
                <CardDescription>
                    Espace de gestion des articles
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                <Suspense fallback={<p>Chargements...</p>}>
                    <ArticleList
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canPublish={canPublish}
                    />
                </Suspense>
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <CreateArticleButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}
