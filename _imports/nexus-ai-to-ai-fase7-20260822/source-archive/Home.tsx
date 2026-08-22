import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Terminal } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <header className="border-b border-cyan-500/30 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-pink-500">
            NexusAI-to-AI Hub
          </h1>
          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <>
                <span className="text-cyan-400 text-sm">{user.name}</span>
                <Button
                  onClick={() => logout()}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-400/50"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gnox Terminal Card */}
          <div
            onClick={() => setLocation("/gnox")}
            className="p-6 bg-slate-900/50 border border-cyan-500/30 rounded-lg hover:border-cyan-400/50 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="flex items-center gap-3 mb-3">
              <Terminal className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-cyan-400">Gnox Terminal</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Natural language command interface for the Nexus ecosystem. Execute commands, manage missions, and monitor system metrics in real-time.
            </p>
            <Button className="bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-400/50">
              Launch Terminal
            </Button>
          </div>

          {/* Placeholder for future features */}
          <div className="p-6 bg-slate-900/50 border border-purple-500/30 rounded-lg opacity-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-purple-400/30 rounded" />
              <h2 className="text-xl font-bold text-purple-400">Coming Soon</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">More features coming in future phases...</p>
            <Button disabled className="bg-purple-500/20 text-purple-400 border border-purple-400/50">
              Unavailable
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
