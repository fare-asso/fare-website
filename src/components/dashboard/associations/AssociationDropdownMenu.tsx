import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export default function AssociationDropdownMenu({
    children
}: {
    children: React.ReactElement[]
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>...</DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuSeparator />
                {children}

                {/* <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Team</DropdownMenuItem>
                <DropdownMenuItem>Subscription</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
