"use client";

import { signOut } from "next-auth/react";

export default function SignoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
    >
      Log Out
    </button>
  );
}