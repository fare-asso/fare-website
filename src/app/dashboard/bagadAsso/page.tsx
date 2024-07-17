import Equipments from "@/components/dashboard/bagadAsso/equipments"
import Tickets from "@/components/dashboard/bagadAsso/tickets"
import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function BagadAsso() {
    return(
        <Card className="w-full h-full flex-1 flex flex-col">
            <CardHeader>
                <CardTitle>Espace Bagad'Asso</CardTitle>
                <CardDescription>Espace de gestion des tickets et du matériel du projet Bagad'Asso</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
                <Tabs defaultValue="tickets" className="w-full h-full flex flex-col items-center">
                    <TabsList className="grid w-full md:w-1/2 grid-cols-2">
                        <TabsTrigger value="tickets">Tickets</TabsTrigger>
                        <TabsTrigger value="materials">Matériels</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tickets" className="w-full flex-1">
                        <Tickets/>
                    </TabsContent>
                    <TabsContent value="materials" className="w-full flex-1">
                        <Equipments/>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                
            </CardFooter>
        </Card>
      )
}