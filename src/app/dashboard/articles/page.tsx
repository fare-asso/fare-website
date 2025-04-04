import CreateArticleButton from "@/components/dashboard/Articles/createArticleButton";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Suspense } from "react";

import ArticleList from "@/components/dashboard/Articles/articleList";

export default async function Articles() {
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
                    <ArticleList />
                </Suspense>
            </CardContent>
            <CardFooter className="p-0">
                <CreateArticleButton />
            </CardFooter>
        </Card>
    );
}
