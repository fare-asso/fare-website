
import Link from 'next/link';
import Image from 'next/image';

import logoAgoraE from '/public/AGORAe/logo_AgoraE.png';
import logoBTP from '/public/BTP/LOGO_BTP_2024.webp';
import logoBA from '/public/logoBagadAsso.png';

export default async function Projets() {


    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16 mb-20">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Projets</h1>

            <div className='w-3/4 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-x-20'>
                
                <Link href= "/agorae" className='flex flex-col items-center hover:scale-105 transition-all'>
                    <Image src={logoAgoraE} alt="Logo de l'AGORAé" className="w-52 h-auto aspect-square object-contain" />
                    <h2>Projet AGORAé</h2>
                </Link>

                <Link href="/bouge-ta-prison" className='flex flex-col items-center hover:scale-105 transition-all'>
                    <Image src={logoBTP} alt="Logo du projet Bouge Ta Prison" className="w-52 h-auto aspect-square object-contain" />
                    <h2>Projet Bouge Ta Prison</h2>
                </Link>

                <Link href="/bagadAsso" className='flex flex-col items-center hover:scale-105 transition-all'>
                    <Image src={logoBA} alt="Logo du projet Bagad'Asso" className="w-52 h-auto aspect-square object-contain" />
                    <h2>Projet Bagad'Asso</h2>
                </Link>
            </div>

        </div>
    );
}