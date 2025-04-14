"use client";

import { usePathname } from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../ui/breadcrumb";
import Link from "next/link";
import React from "react";

export default function CurrentRoute() {
    const path = usePathname();

    const pathArray = path.split("/").filter((p) => p !== "");

    return (
        <Breadcrumb className="ml-2">
            <BreadcrumbList>
                {pathArray.map((p, index) => {
                    const href = `/${pathArray.slice(0, index + 1).join("/")}`;
                    if (index === pathArray.length - 1) {
                        return (
                            <BreadcrumbItem key={index}>
                                <BreadcrumbPage className="capitalize">
                                    {p}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        );
                    } else {
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link
                                            href={href}
                                            className="capitalize"
                                        >
                                            {p}
                                        </Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                            </React.Fragment>
                        );
                    }
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
