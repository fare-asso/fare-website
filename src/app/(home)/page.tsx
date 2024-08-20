import Image from "next/image";
import { Metadata } from "next";
import DiscordWidget from "@/components/public/discordWidget";

import WelcomeImage from "../../../public/welcome.jpg";

export const metadata: Metadata = {
  title: "Accueil | FAHB"
}

export default function Home() {
  return (
    <div>
      
      <div className="flex flex-col md:flex-row mt-8 mb-4 w-full">
        <Image src={WelcomeImage} alt="Image des membres du bureau" className="w-full rounded-lg" />
        <div className="w-full flex flex-col mt-2 md:mt-0 md:mx-2 [&_span]:text-black">
          <div className="rounded-lg bg-yellow-400 flex flex-col items-center justify-center p-2 h-full mb-2">
            <span className="text-3xl font-semibold">17</span>
            <span className="text-xl">Associations étudiantes</span>
          </div>
          <div className="rounded-lg bg-yellow-400 flex flex-col items-center justify-center p-2 h-full mb-2">
            <span className="text-3xl font-semibold">88 000</span>
            <span className="text-xl">Étudiant.e.s</span>
          </div>
          <div className="rounded-lg bg-yellow-400 flex flex-col items-center justify-center p-2 h-full">
            <span className="text-3xl font-semibold">28</span>
            <span className="text-xl">Élu.e.s universitaires & CROUS</span>
          </div>
        </div>
      </div>


      <DiscordWidget />
    </div>
      
  );
}
