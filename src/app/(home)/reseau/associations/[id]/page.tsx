import prisma from "@/helpers/db";
import { createClient } from "@/helpers/supabase/server";
import Image from "next/image";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
    params,
  }: {params : {id: string}}): Promise<Metadata> {
    const id = params.id;

    if(isNaN(Number(params.id))) return {
        title: "Association",
        description: "Page d'association"
    }

    const associationMetadata = await prisma.association.findUnique({
        where : {
            id: Number(id)
        }
    })

    if(!associationMetadata) {
        return {
            title: "Association Inconnue",
            description: "Nous n'avons pas pu trouver l'association que vous recherchez..."
        }
    }

    return {
      title: `FAHB - ${associationMetadata.name}`,
      description: associationMetadata.desc,
    };
  }

export default async function Page({params} : {params : { id: string }}) {

    const supabase = createClient();

    // check if the parameter is correct
    if(isNaN(Number(params.id))) {
        return (
            <div>
                <span>{"L'association recherchée n'existe pas"}</span>
            </div>
        )
    }

    const associationRecord = await prisma.association.findUnique({
        where: {
            id: Number(params.id)
        }
    })

    if(!associationRecord) {
        return (
            <div>
                <span>{"L'association recherchée n'existe pas ou plus"}</span>
            </div>
        )
    }

    return (
        <div className="w-[90%] flex flex-col items-start pt-14">
            <Link href="/reseau" className="text-sm opacity-40 hover:underline">&lt; Retour aux associations</Link>
            <h1 className="text-3xl font-bold mt-2">{associationRecord.name}</h1>
            <div className="w-full flex flex-row">
                <p>{associationRecord.desc}</p>
                <Image src={supabase.storage.from('association-pictures').getPublicUrl(associationRecord.logoPath[0]).data.publicUrl} width={400} height={400} alt={associationRecord.name + " logo"}
                className=" rounded-lg border border-black aspect-square object-cover h-60 w-60"
                />
            </div>
            

            
            
        </div>
    )

}