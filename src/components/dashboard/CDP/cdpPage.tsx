import { useQuery } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { FaRegFilePdf } from "react-icons/fa"

import type { CDPWithUrls } from "@/actions/CDP/listCDPAction"
import DashboardShell, { type ShellUser } from "@/components/dashboard/shell"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"

import AddNewCDPButton from "./addCDPButton"
import CdpCard from "./CDPCard"

interface CDPPageProps {
    user: ShellUser
    pathname: string
    initialData: CDPWithUrls[]
    canCreate: boolean
    canDelete: boolean
}

function CDPContent({
    initialData,
    canCreate,
    canDelete
}: Omit<CDPPageProps, "user" | "pathname">) {
    const { data: communiques } = useQuery({
        queryKey: ["cdp"],
        queryFn: async () => {
            const { data, error } = await actions.cdp.listCDPAction()
            if (error || !data.success) {
                throw new Error("Échec du chargement des communiqués.")
            }
            return data.value
        },
        initialData
    })

    return (
        <Card className="flex h-full w-full flex-1 flex-col border-none p-0 shadow-none">
            <CardHeader className="p-0">
                <CardTitle>Communiques de presse</CardTitle>
                <CardDescription>
                    Espace de gestion des communiques de presse de la Federation
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
                {communiques.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                        <div className="bg-muted rounded-full p-3">
                            <FaRegFilePdf
                                size={24}
                                className="text-muted-foreground"
                            />
                        </div>
                        <p className="text-sm font-medium">Aucun document</p>
                        <p className="text-muted-foreground text-xs">
                            Ajoutez un communique ou dossier de presse pour
                            commencer
                        </p>
                    </div>
                ) : (
                    <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
                        <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {communiques.map(({ cdp, url, dlUrl }) => (
                                <CdpCard
                                    key={cdp.id}
                                    cdp={cdp}
                                    url={url}
                                    dlUrl={dlUrl}
                                    canDelete={canDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            {canCreate ? (
                <CardFooter className="p-0">
                    <AddNewCDPButton />
                </CardFooter>
            ) : null}
        </Card>
    )
}

export default function CDPPage({ user, pathname, ...rest }: CDPPageProps) {
    return (
        <DashboardShell user={user} pathname={pathname}>
            <CDPContent {...rest} />
        </DashboardShell>
    )
}
