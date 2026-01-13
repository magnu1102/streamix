"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);
    if (res.ok) {
      setStep("verify");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await fetch("/api/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    setIsLoading(false);
    if (res.ok) {
      router.push("/login?registered=true");
    } else {
      const data = await res.json();
      setError(data.error || "Verification failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {step === "form" ? "Create Account" : "Verify Email"}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleInit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                placeholder="Min 8 chars, Upper, Lower, Number, Symbol"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Sending Code..." : "Next"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-300 text-center mb-4">
              We sent a code to <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Create"}
            </button>
            <button
              type="button"
              onClick={() => setStep("form")}
              className="w-full text-sm text-gray-400 hover:text-white mt-2"
            >
              Back
            </button>
          </form>
        )}
        
        {step === "form" && (
          <p className="mt-4 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:underline">
              Login
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}