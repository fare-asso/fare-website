import Image from "next/image";
import { Metadata } from "next";
import DiscordWidget from "@/components/public/discordWidget";

import WelcomeImage from "../../../public/welcome.jpg";
import Link from "next/link";
import LinkButton from "@/components/public/link";
import AssociationMapCaller from "@/components/public/associations/map/associationMapCaller";
import prisma from "@/helpers/db";

export const metadata: Metadata = {
  title: "Accueil | FAHB"
}

export default async function Home() {

  const associations = await prisma.association.findMany()

  return (
    <div className="w-full md:w-[90%] flex flex-col items-center">
      
      {/* Welcome picture and key numbers */}
      <div className="w-full flex flex-col md:flex-row mt-8 mb-4">
        <Image src={WelcomeImage} alt="Image des membres du bureau" className="w-full rounded-xl" />
        <div className="w-full flex flex-col mt-2 md:mt-0 md:ml-4 [&_span]:text-white flex-shrink-[2]">
          <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full mb-2 md:mb-4">
            <span className="text-2xl md:text-[2.5rem] font-semibold">17</span>
            <span className="text-xl md:p-1 opacity-95">Associations étudiantes</span>
          </div>
          <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full mb-2 md:mb-4">
            <span className="text-2xl md:text-[2.5rem] font-semibold">88 000</span>
            <span className="text-xl md:p-1 opacity-95">Étudiant.e.s</span>
          </div>
          <div className="rounded-xl bg-fahbyellow flex flex-col items-center justify-center p-4 md:p-2 h-full">
            <span className="text-2xl md:text-[2.5rem] font-semibold">28</span>
            <span className="text-xl md:p-1 opacity-95">Élu.e.s universitaires & CROUS</span>
          </div>
        </div>
      </div>

      {/* Who are we */}
      <div className="my-10 w-full flex flex-col items-center">
        <div className="w-full md:w-[80%] rounded-xl flex flex-col items-start justify-between px-12 py-8 bg-black text-lg text-white">
          <h2 className="text-2xl mb-2 font-semibold">Qui sommes-nous ?</h2>
          <p className="">
            La Fédération des Associations de Haute-Bretagne (FAHB) est une organisation humaniste et militante qui représente les étudiant.e.s d'Ille-et-Vilaine et des Côtes d'Armor.
            Indépendante de tout parti politique, elle œuvre chaque jour pour améliorer la vie des 88 000 étudiant.e.s du territoire grâce à des projets construits "par et pour les étudiant.e.s".
          </p>
          <div className="w-full flex items-center flex-col pt-8">
            <LinkButton href="/about" title="En savoir +" className="bg-white text-black"/>
          </div>
        </div>
      </div>
      

      {/* Last articles */}
      <div className="my-10 w-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">
          Actualités
        </h2>
        <div className="w-full flex flex-row space-x-2">
          <div className="rounded-xl h-32 w-24 bg-gray-600">

          </div>
          <div className="rounded-xl h-32 w-24 bg-gray-600">

          </div>
        </div>

      </div>

      {/* Le réseau */}
      <div className="my-10 w-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">
          Notre réseau
        </h2>
        <div className="flex flex-col items-center">
          <AssociationMapCaller associations={associations} />
        </div>
        
      </div>

      {/* Les évènements à venir */}
      <div className="my-10 w-full flex flex-col">
        <h2 className="text-2xl font-semibold mb-2">
          Les évènements à venir
        </h2>
        <div className="w-full flex flex-row space-x-2">
          
        </div>
        
      </div>



      <DiscordWidget />
    </div>
      
  );
}
