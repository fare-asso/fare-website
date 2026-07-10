import { actions } from "astro:actions"
import { LogOut } from "lucide-react"
import { useTransition } from "react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { SidebarMenuButton } from "../ui/sidebar"

interface AccountButtonProps {
    name?: string | null
    email: string
    image?: string | null
}

export default function AccountButton({
    name,
    email,
    image
}: AccountButtonProps): React.JSX.Element {
    const [isPending, startTransition] = useTransition()

    function handleSignOut(): void {
        startTransition(async () => {
            const { data, error } = await actions.auth.signOut()
            if (error || !data.success) {
                toast.error("Erreur lors de la déconnexion")
                return
            }
            window.location.href = "/login"
        })
    }

    // Get initials from name or email
    const getInitials = (): string => {
        if (name) {
            const nameParts = name.trim().split(" ")
            if (nameParts.length >= 2) {
                const first = nameParts[0] ?? ""
                const last = nameParts.at(-1) ?? ""
                return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase()
            }
            return name.substring(0, 2).toUpperCase()
        }
        return email.substring(0, 2).toUpperCase()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-sidebar-accent h-auto w-full justify-start gap-2 px-2 py-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage
                            src={image || undefined}
                            alt={name || email}
                        />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                        <span className="truncate text-sm font-semibold">
                            {name || email.split("@")[0]}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                            {email}
                        </span>
                    </div>
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isPending}
                    className="text-destructive focus:text-destructive cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
