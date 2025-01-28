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
        <div className="flex h-auto w-full flex-row items-center justify-between border-b p-4 lg:min-h-screen lg:w-1/6 lg:flex-col lg:border-b-0 lg:border-r">
            <div className="select-none text-lg font-semibold">Dashboard</div>

            <div className="hidden h-full flex-row items-center justify-center lg:mt-10 lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:space-y-2">
                <div className="flex flex-row items-center space-x-2 space-y-0 lg:flex-col lg:space-x-0 lg:space-y-2">
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

                <div className="ml-2 flex flex-col items-center justify-center space-y-0 lg:ml-0 lg:space-y-2">
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
                    <div className="flex h-full flex-col items-start justify-between space-y-2 pt-5">
                        <div className="flex flex-col items-start space-y-2">
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

                        <div className="flex w-full flex-col items-center justify-center space-y-0">
                            {children}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
