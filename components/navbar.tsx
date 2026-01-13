import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignoutButton from "./signout-button";

export default async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-white tracking-tight">
              Streamix<span className="text-blue-500">.</span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            {session ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
                <Link 
                  href="/watch" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Watch
                </Link>
                <div className="h-4 w-px bg-gray-700"></div>
                <SignoutButton />
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-md transition-colors"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}