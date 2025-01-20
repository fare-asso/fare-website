import { Association } from "@prisma/client";
import AssociationCard from "./associationCard";

export default function AssociationList({
    associations,
}: {
    associations: Association[];
}) {
    return (
        <div className="w-[90%] mb-20">
            <h2 className="text-[1.75rem] font-semibold mb-6">
                Les Associations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full h-full">
                {associations.map((asso) => (
                    <AssociationCard key={asso.id} association={asso} />
                ))}
            </div>
        </div>
    );
}
