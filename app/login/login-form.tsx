"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordLogin, setIsPasswordLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = () => {
    if (error) return error;
    if (errorParam === "AccountNotFound") return "Account not found";
    if (errorParam === "AccessDenied") return "Access denied. Please check your email.";
    return null;
  };

  const activeError = getErrorMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isPasswordLogin) {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/watch"); // Redirect to watch page on success
          router.refresh();
        }
      } else {
        const res = await signIn("email", {
          email,
          redirect: false,
          callbackUrl: "/watch",
        });

        if (res?.error) {
          setError("Failed to send login link");
        } else if (res?.url && res.url.includes("error=AccountNotFound")) {
          setError("Account not found");
        } else {
          setError("Check your email for the login link!");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center text-white mb-2">
        {isPasswordLogin ? "Sign In" : "Magic Link Login"}
      </h1>
      
      {registered && (
        <div className="mb-4 p-2 bg-green-500/20 text-green-200 text-sm text-center rounded border border-green-500">
          Account created! Please log in.
        </div>
      )}

      {activeError && (
        <div className={`mb-4 p-3 rounded text-sm text-center border ${
          activeError.includes("Check") 
            ? "bg-blue-500/20 text-blue-200 border-blue-500" 
            : "bg-red-500/20 text-red-200 border-red-500"
        }`}>
          {activeError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
            placeholder="you@example.com"
            required
          />
        </div>

        {isPasswordLogin && (
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none text-white"
              placeholder="••••••••"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold rounded transition-colors"
        >
          {isLoading ? "Processing..." : (isPasswordLogin ? "Sign In" : "Send Magic Link")}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-sm text-gray-400">
        <button 
          onClick={() => {
            setIsPasswordLogin(!isPasswordLogin);
            setError("");
          }}
          className="text-blue-400 hover:underline"
        >
          {isPasswordLogin ? "Use Magic Link instead" : "Use Password instead"}
        </button>
        
        <p>
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}