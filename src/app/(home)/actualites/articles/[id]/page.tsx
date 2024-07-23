import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import Link from "next/link";

import { convertDeltaToHTML } from "@/helpers/quill";
import { format } from "date-fns";
import MoreArticles from "@/components/public/articles/moreArticles";

export default async function Page({params} : {params : {id: string}}) {
    const supabase = createClient();

    // check if the parameter is correct
    if(isNaN(Number(params.id))) {
        return (
            <div>
                <span>{"L'article recherché n'existe pas"}</span>
            </div>
        )
    }

    const articleRecord = await prisma.article.findUnique({
        where: {
            id: Number(params.id)
        }
    })

    if(!articleRecord) {
        return (
            <div>
                <span>{"L'article recherché n'existe pas ou plus"}</span>
            </div>
        )
    }

    return (
        <div className="w-[90%] flex flex-col items-start pt-14">
            <Link href="/actualites" className="text-sm opacity-40 hover:underline">&lt; Retour aux actualités</Link>
            
            {/* Title */}
            <h1 className="text-3xl font-bold mt-2">{articleRecord.title}</h1>

            {/* Date */}
            <span className="text-black opacity-75 text-sm">{`Publié le ${format(articleRecord.writtenOn, 'dd/MM/yyyy')} à ${format(articleRecord.writtenOn, "HH'h'mm")}`}</span>

            {/* Content */}
            <div className="w-full flex flex-col mt-8 [&_*]:transition-all
            [&_ol]:list-decimal
            [&_ul]:list-disc 
            [&_a]:text-yellow-500 [&_a]:underline [&_a]:underline-offset-2 [&_a]:tracking-wide hover:[&_a]:text-yellow-300 hover:[&_a]:underline-offset-4
            [&_img]:max-w-[500px] [&_img]:max-h-[400px] [&_img]:mx-auto [&_img]:my-4 [&_img]:rounded-sm
            ">
                {/* Parse article content to HTML */}
                {convertDeltaToHTML(articleRecord.content)}
            </div>

            <MoreArticles currentArticleId={articleRecord.id}/>
            

            
            
        </div>
    )
}