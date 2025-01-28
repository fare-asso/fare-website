import ArticleList from "@/components/public/articles/articleList";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Actualités | FAHB",
    description: "Page regroupant les actualités lié à la FAHB",
};

export default async function ActualitePage() {
    return (
        <div className="flex w-full flex-col items-center justify-start">
            <h1 className="py-12 text-3xl font-semibold md:py-32">
                {"Actualités"}
            </h1>
            <div className="flex h-full w-full flex-col items-center">
                <ArticleList />
            </div>
        </div>
    );
}
