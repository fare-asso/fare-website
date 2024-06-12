import AssoCard from "@/components/assoCard";
import prisma from "@/helpers/db";

export default async function Reseau() {

    const assos = await prisma.association.findMany();
    const assosCards = assos.map((asso) => <AssoCard key={asso.id} name={asso.name} major={asso.major} location={asso.location} logo={asso.logoPath[0]} />)
    return(
        <>
        Le réseau associatif
        {assosCards}
        </>
    )
}