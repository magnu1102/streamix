import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SecurityButtons from "./security-buttons";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user;

  // Placeholder for user initials
  const initials = user.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "??";

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center gap-6 pb-8 border-b border-gray-800">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-900/20">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Info Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Account Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">Email</label>
                <div className="flex items-center justify-between p-3 bg-gray-950 rounded border border-gray-800">
                  <span className="text-gray-300">{user.email}</span>
                  <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20">
                    Verified
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs uppercase text-gray-500 font-bold mb-1">User ID</label>
                <div className="p-3 bg-gray-950 rounded border border-gray-800 font-mono text-xs text-gray-400 break-all">
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-500 rounded-full"></span>
              Security Zone
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-white mb-1">Session Management</h3>
                <p className="text-sm text-gray-400 mb-4">
                  If you suspect your account was accessed by someone else, or you forgot to log out on a public computer.
                </p>
                <SecurityButtons />
              </div>

              {/* Expandable Area: Password Change could go here */}
              {/* <div className="pt-4 border-t border-gray-800">
                 <button className="...">Change Password</button>
              </div> 
              */}
            </div>
          </div>

          {/* Future Expansion: Billing / Club Management */}
          <div className="md:col-span-2 bg-gray-900/50 rounded-xl border border-gray-800 border-dashed p-6 flex flex-col items-center justify-center text-gray-500 gap-2 min-h-[150px]">
            <p className="font-medium">Club Management & Billing</p>
            <span className="text-sm">Coming in Phase 2</span>
          </div>

        </div>
      </div>
    </div>
  );
}