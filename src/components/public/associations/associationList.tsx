import { Association } from "@prisma/client";
import AssociationCard from "./associationCard";

export default function AssociationList({
    associations,
}: {
    associations: Association[];
}) {
    return (
        <div className="mb-20 w-[90%]">
            <h2 className="mb-6 text-[1.75rem] font-semibold">
                Les Associations
            </h2>
            <div className="grid h-full w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                {associations.map((asso) => (
                    <AssociationCard key={asso.id} association={asso} />
                ))}
            </div>
        </div>
    );
}
