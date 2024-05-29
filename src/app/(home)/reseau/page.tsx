import AssoCard from "@/components/assoCard";
import prisma from "@/helpers/db";

export default async function Reseau() {

    const assos = await prisma.association.findMany();
    const assosCards = assos.map((asso) => <AssoCard name={asso.name} major={asso.major} location={asso.location} logo={asso.logo} />)
    return(
        <>
        Le réseau associatif
        {assosCards}
        </>
    )
}