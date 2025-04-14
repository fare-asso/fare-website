import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import prisma from "@/helpers/db";

export default async function UsersPage() {
    const users = await prisma.user.findMany({
        include: {
            permissions: true,
        },
    });

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Utilisateurs</CardTitle>
                <CardDescription>
                    Espace de gestion des utilisateurs du site de la FAHB
                </CardDescription>
            </CardHeader>
            <CardContent className="h-1/2 flex-1 p-0">
                <DataTable columns={columns} data={users} />
            </CardContent>
            <CardFooter className="p-0"></CardFooter>
        </Card>
    );
}
