"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { revokeAllSessions } from "./actions";

export default function SecurityButtons() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGlobalSignOut = async () => {
    if (!confirm("Are you sure? This will log you out of all devices, including this one.")) {
      return;
    }

    setIsLoading(true);
    try {
      // 1. Invalidate in DB
      await revokeAllSessions();
      
      // 2. Clear local cookies & redirect
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Failed to revoke sessions", error);
      setIsLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={handleGlobalSignOut}
        disabled={isLoading}
        className="flex items-center justify-center px-4 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 border border-red-600/20 rounded-lg transition-all font-medium disabled:opacity-50"
      >
        {isLoading ? "Revoking Access..." : "Sign Out of All Devices"}
      </button>
      <p className="text-xs text-gray-500">
        This effectively changes your security stamp. Any browser with an old cookie will be rejected immediately.
      </p>
    </div>
  );
}