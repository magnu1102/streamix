import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// import { redirect } from "next/navigation"; <--- Remove or comment out this import
import Link from "next/link";
import SignoutButton from "./signout-button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  //COMMENT OUT this block for no bounce to login page for guest users:
  /*
  if (!session) {
    redirect("/login");
  }
  */

  // Render Guest View if no session
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-3xl font-bold mb-6">Streamix</h1>
          <p className="text-gray-400 mb-8">
            Welcome to the platform. Please log in to continue.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Log In
            </Link>
            <Link 
              href="/register"
              className="block w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard for Logged-In Users (Existing Code)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-2">Streamix</h1>
        <p className="text-gray-400 mb-8">
          Welcome back, <span className="text-blue-400">{session.user?.email}</span>
        </p>

        <div className="space-y-4">
          <Link 
            href="/watch"
            className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Go to Watch Page
          </Link>
          
          <div className="pt-4 border-t border-gray-700">
            <SignoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}