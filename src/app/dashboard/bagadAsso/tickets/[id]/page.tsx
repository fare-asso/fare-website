import prisma from "@/helpers/db"



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

    return(
        <div className="w-full h-full">
            <h1 className="font-semibold text-2xl">Ticket <span className="font-mono opacity-80">#{ticket.id}</span></h1>

            {/* Divide space in two (large screen) */}
            <div className="w-full h-full flex flex-col md:flex-row m-0">

                {/* Left Part (Top mobile) */}
                <div className="bg-red-600 m-0"></div>

                {/* Right Part (Bottom mobile) */}
                <div className="bg-blue-600 m-0"></div>

            </div>
    
        </div>
    )

}