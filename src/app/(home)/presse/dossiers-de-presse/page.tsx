import DossierDePresseCard from '@/components/public/presse/ddpCard';
import prisma from '@/helpers/db';
import Link from 'next/link';

export default async function DossiersDePresse() {
    
    const dossiers = await prisma.communiqueDePresse.findMany({
        where: {
            type: 'DDP'
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <div className="flex flex-col items-center justify-start w-full px-4 md:px-8 lg:px-16 mb-20">
            <h1 className="py-12 sm:py-24 text-4xl font-bold text-center">Dossiers de presse</h1>

            <div className='w-full flex flex-col items-center space-y-2'>
                {
                    dossiers.length > 0 ?
                    dossiers.map((dossier) => <DossierDePresseCard key={dossier.id} dossier={dossier} />)
                    :
                    <span className='text-xl'>{"Nous n'avons pas encore de dossiers de presse.🥲"}</span>
                }
            </div>

        </div>
    );
}