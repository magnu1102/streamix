"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend Timer State
  const [timeLeft, setTimeLeft] = useState(0); 

  const router = useRouter();

  // Timer Countdown Logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

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
      setTimeLeft(120); // Start 2 minute cooldown on success
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

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    setIsLoading(true);
    setError("");
    
    const res = await fetch("/api/register/resend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    
    setIsLoading(false);
    
    if (res.ok) {
      setTimeLeft(120); // Reset timer
      alert("Code resent!");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to resend");
      if (res.status === 429) setTimeLeft(120); 
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
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
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
               <button
                type="button"
                onClick={() => setStep("form")}
                className="text-sm text-gray-400 hover:text-white"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={timeLeft > 0 || isLoading}
                className="text-sm text-blue-400 hover:text-blue-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : "Resend Code"}
              </button>
            </div>
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