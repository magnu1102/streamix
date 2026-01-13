import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center z-10">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6">
            Local Sports. <span className="text-blue-500">Global Reach.</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Streamix brings low-league sports to the big screen. Support your local club, 
            watch live matches, and never miss a highlight.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            {session ? (
              <Link
                href="/watch"
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
              >
                Start Watching
              </Link>
            ) : (
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-lg transition-all shadow-lg"
              >
                Join for Free
              </Link>
            )}
            <a 
              href="#matches" 
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all border border-gray-700"
            >
              Browse Matches
            </a>
          </div>
        </div>
      </section>

      {/* Live Matches Section (Placeholder) */}
      <section id="matches" className="py-20 bg-gray-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-bold text-white">Live Now</h2>
            <span className="text-red-500 animate-pulse text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                <span className="text-gray-600 font-medium">Stream Preview</span>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">District A: Tigers vs. Hawks</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Football</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Started 15 mins ago</p>
                <Link href="/watch" className="block w-full py-2 text-center bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded font-medium transition-all">
                  Watch Live
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors">
              <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                <span className="text-gray-600 font-medium">Stream Preview</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">Semi-Final: Rovers vs. United</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Volleyball</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Started 45 mins ago</p>
                <Link href="/watch" className="block w-full py-2 text-center bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded font-medium transition-all">
                  Watch Live
                </Link>
              </div>
            </div>

            {/* Card 3 (Upcoming) */}
            <div className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors opacity-75">
              <div className="aspect-video bg-gray-800 relative flex items-center justify-center">
                <span className="text-gray-500 font-medium">Starting Soon</span>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-white">Regional Cup: Finals</h3>
                  <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">Basketball</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">Starts in 2 hours</p>
                <button disabled className="block w-full py-2 text-center bg-gray-800 text-gray-500 cursor-not-allowed rounded font-medium">
                  Not Started
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}