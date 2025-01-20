import { BagadAssoEquipment, BagadAssoTicket } from "@prisma/client";
import prisma from "./db";

interface Equipement {
    id: number;
    quantity: number;
}

interface DetailedEquipment
    extends Equipement,
        Pick<BagadAssoEquipment, "deposit" | "name" | "imagePath"> {}

type TicketWithDetailedEquipments = Omit<BagadAssoTicket, "equipments"> & {
    equipments: DetailedEquipment[];
};

export async function computeTotalDeposit(
    ticket: BagadAssoTicket,
): Promise<number> {
    const equipments: Equipement[] = await JSON.parse(
        ticket.equipments!.toString(),
    );

    const equipmentIds: number[] = equipments.map((e) => e.id);

    const equipmentData = await prisma.bagadAssoEquipment.findMany({
        where: {
            id: { in: equipmentIds },
        },
        select: {
            id: true,
            deposit: true,
        },
    });

    // Création d'une map pour accéder rapidement aux dépôts par id
    const depositMap = equipmentData.reduce(
        (map, equipment) => {
            map[equipment.id] = equipment.deposit;
            return map;
        },
        {} as Record<number, number>,
    );

    // Calcul du dépôt total en utilisant la quantité et le dépôt de chaque équipement
    const totalDeposit = equipments.reduce((total, equipement) => {
        const deposit = depositMap[equipement.id] || 0; // Si pas de dépôt trouvé, considérer 0
        return total + equipement.quantity * deposit;
    }, 0);

    return totalDeposit;
}

export async function joinTicketAndEquipment(
    ticket: BagadAssoTicket,
): Promise<BagadAssoTicket> {
    const equipments: Equipement[] = await JSON.parse(
        ticket.equipments!.toString(),
    );
    const equipmentIds: number[] = equipments.map((e) => e.id);

    // Requête pour récupérer les informations détaillées des équipements depuis la base de données
    const equipmentData = await prisma.bagadAssoEquipment.findMany({
        where: {
            id: { in: equipmentIds },
        },
        select: {
            id: true,
            deposit: true,
            name: true,
            imagePath: true,
        },
    });

    // Créer un map pour un accès rapide aux données d'équipement
    const equipmentMap = new Map(equipmentData.map((e) => [e.id, e]));

    // Mettre à jour les équipements du ticket avec les données détaillées
    const updatedEquipments = equipments.map((e) => ({
        ...e,
        ...equipmentMap.get(e.id),
    }));

    // Retourner le ticket mis à jour avec les équipements détaillés
    return {
        ...ticket,
        equipments: updatedEquipments,
    };
}
