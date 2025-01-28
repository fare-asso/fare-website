"use client";

import { useState } from "react";
import SignOutAction from "@/actions/auth/signOutAction";
import { Button } from "../ui/button";
import { MdLogout } from "react-icons/md";

export default function SignOutButton() {
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await SignOutAction();
        } catch (error) {
            console.error("Error during sign out:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSignOut}
            className="flex h-auto flex-row items-center justify-center px-4"
            disabled={loading}
        >
            <MdLogout className="mr-1" size={20} />
            <div className="text-base lg:text-sm">
                {loading ? "Déconnexion..." : "Se déconnecter"}
            </div>
        </Button>
    );
}
