import { computeTotalDeposit, joinTicketAndEquipment } from "@/helpers/bagadAsso";
import prisma from "@/helpers/db"
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";



export default async function Page({params} : {params : { id: string }}) {

    let ticketId: number | undefined;

    // check if the parameter is correct
    if(isNaN(Number(params.id))) {
        return (
            <div>
                <span>{"L'adresse du ticket n'est pas valide."}</span>
            </div>
        )
    } else {
        ticketId = Number(params.id);
    }

    const ticket = await prisma.bagadAssoTicket.findUnique({
        where: {
            id: ticketId
        }
    })


    if(!ticket) {
        return(
            <span>Le ticket n'existe pas 😔</span>
        )
    }

    const totalDeposit = await computeTotalDeposit(ticket);

    const allEquipments: {id: number, quantity: number, deposit: number, name: string, imagePath: string | undefined}[] = JSON.parse(JSON.stringify((await joinTicketAndEquipment(ticket)).equipments));

    return(
        <div className="w-full h-full">
            <Link href="/dashboard/bagadAsso" className="text-sm underline hover:font-bold transition-all opacity-80">&lsaquo; Retour aux tickets</Link>
            <h1 className="font-semibold text-2xl mt-4">🗒️Ticket <span className="font-mono opacity-80">#{ticket.id}</span></h1>
            <span className="text-sm">Demande soumise le <span className="font-bold">{format(ticket.creationDate, "dd/MM/yy")}</span></span>

            {/* Divide space in two (large screen) */}
            <div className="w-full flex flex-col md:flex-row m-0">

                {/* Left Part (Top mobile) */}
                <div className="h-full w-full p-4 flex flex-col">

                    <span>Soumis par: <b>{ticket.firstName} {ticket.lastName}</b></span>
                    <span>Pour l'association: <b>{ticket.assocation}</b></span>
                    <span>Email de l'association: <a href={`mailto:${ticket.associationEmail}`} className="underline hover:font-semibold transition-all">✉️{ticket.associationEmail}</a></span>
                    
                    <span className="mt-4">Téléphone de contact: <a href="tel:{ticket.phoneNumber}" className="">📞{ticket.phoneNumber}</a></span>
                    <span>Email de contact: <a href={`mailto:${ticket.representativeEmail}`} className="underline hover:font-semibold transition-all">✉️{ticket.representativeEmail}</a></span>

                    <span className="mt-4">Nom de l'évènement: <span className="font-bold">{`${ticket.eventName}`}</span></span>
                    <span>Type de l'évènement: <span className="font-bold">🎈{`${ticket.eventType}`}</span></span>
                    <span>Date de l'évènement: 📅{format(ticket.eventDate, "dd MMMM yyyy", {locale: fr})}</span>
                    <span>Lieu de l'évènement: <a href={`https://www.google.fr/maps/search/${ticket.eventAddr}`} target="blank" className="underline hover:font-bold transition-all" >🗺️{ticket.eventAddr}</a></span>

                    <span>Nombre de participants estimé: <b>👥{ticket.estimatedParticipants} personnes</b></span>

                    <span className="mt-4">Caution totale: <b>🏦{totalDeposit}€</b></span>

                    
                </div>

                {/* Right Part (Bottom mobile) */}
                <div className="h-full w-full p-4">
                    <h2 className="font-bold text-xl">🪩Matériels demandés:</h2>
                    {/* Equipments List */}
                    <div className="px-2 py-1 flex flex-col">
                        { allEquipments.map((equipment) =>
                        <div key={equipment.id} id={`${equipment.id}`}>
                            {equipment.quantity}&times; {equipment.name} (caution: {equipment.quantity * equipment.deposit}€)
                        </div>)}
                    </div>
                </div>

            </div>
    
        </div>
    )

}