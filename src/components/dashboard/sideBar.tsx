"use client";

import { MdOutlineMenu } from "react-icons/md";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

import SideBarLink from "./sideBarLink";
import { MouseEventHandler, useState } from "react";

import { MouseEvent } from "react";

export default function SideBar({ children }: { children: JSX.Element[] }) {
    const [open, setOpen] = useState<boolean>(false);

    const handleSidebarCollapse = (
        event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>,
    ) => {
        setOpen(false);
    };

    return (
        <div className="w-full h-auto lg:min-h-screen lg:border-r lg:w-1/6 p-4 flex flex-row lg:flex-col items-center justify-between">
            <div className="font-semibold text-lg select-none">Dashboard</div>

            <div className="hidden lg:flex flex-row lg:flex-col lg:flex-1 items-center lg:space-y-2 lg:mt-10 h-full justify-center lg:justify-between">
                <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 space-y-0 items-center">
                    <SideBarLink href="/dashboard/events" title="Evènements" />
                    <SideBarLink
                        href="/dashboard/associations"
                        title="Associations"
                    />
                    <SideBarLink href="/dashboard/articles" title="Articles" />
                    <SideBarLink
                        href="/dashboard/communiques-de-presse"
                        title="Presse"
                    />
                    <SideBarLink href="/dashboard/membres" title="Membres" />
                    <SideBarLink
                        href="/dashboard/bagadAsso"
                        title="Bagad'Asso"
                    />
                    <SideBarLink
                        href="/dashboard/adhesions"
                        title="Adhésions"
                    />
                </div>

                <div className="flex flex-col items-center justify-center space-y-0 lg:space-y-2 ml-2 lg:ml-0">
                    {children}
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <button className="block lg:hidden">
                        <MdOutlineMenu size={25} />
                    </button>
                </SheetTrigger>
                <SheetContent className="lg:hidden">
                    <div className="flex flex-col items-start space-y-2 h-full justify-between pt-5">
                        <div className="flex flex-col space-y-2 items-start">
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/events"
                                title="Evènements"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/associations"
                                title="Associations"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/articles"
                                title="Articles"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/communiques-de-presse"
                                title="Presse"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/membres"
                                title="Membres"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/bagadAsso"
                                title="Bagad'Asso"
                            />
                            <SideBarLink
                                onClick={handleSidebarCollapse}
                                href="/dashboard/adhesions"
                                title="Adhésions"
                            />
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-0 w-full">
                            {children}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
