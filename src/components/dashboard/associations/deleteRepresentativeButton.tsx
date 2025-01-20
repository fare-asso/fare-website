"use client";

import { Button } from "@/components/ui/button";
import { Association } from "@prisma/client";
import { FaUserSlash } from "react-icons/fa";

export default function DeleteRepresentativeButton({
    association,
}: {
    association: Association;
}) {
    return (
        <Button className="p-1 h-auto whitespace-normal" variant="destructive">
            <FaUserSlash size={20} />
        </Button>
    );
}
