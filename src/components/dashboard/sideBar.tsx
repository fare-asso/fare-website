import CurrentUser from "./currentUser"
import SideBarLink from "./sideBarLink"
import SignOutButton from "./signOutButton"

export default function SideBar() {
    return(
        <div className="min-h-screen border-r w-1/6 p-4 flex flex-col items-center">
            <div className="font-semibold text-lg select-none">
                Dashboard
            </div>

            <div className="flex flex-col items-center space-y-2  mt-10 h-full justify-between">
                <div className="flex flex-col space-y-2">
                    <SideBarLink href="/dashboard/events" title="Evènements"/>
                    <SideBarLink href="/dashboard/associations" title="Associations"/>
                    <SideBarLink href="/dashboard/articles" title="Articles"/>
                    <SideBarLink href="/dashboard/communiques-de-presse" title="Communiqués de presse"/>
                    <SideBarLink href="/dashboard/membres" title="Membres"/>
                </div>

                <div className="flex flex-col items-center justify-center space-y-2">
                    <CurrentUser/>
                    <SignOutButton/>
                </div>
                
            </div>

            
            
        </div>
    )
}