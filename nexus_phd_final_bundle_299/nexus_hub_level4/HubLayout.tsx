import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Gavel,
  Zap,
  TrendingUp,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface HubLayoutProps {
  children: React.ReactNode;
}

export default function HubLayout({ children }: HubLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/" },
    { label: "Conselho", icon: Gavel, href: "/council" },
    { label: "Startups", icon: Zap, href: "/startups" },
    { label: "Mercado", icon: TrendingUp, href: "/market" },
    { label: "Finanças", icon: Wallet, href: "/finance" },
    { label: "Agentes", icon: Users, href: "/agents" },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              NEXUS-HUB
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-slate-200"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-400 transition-colors"
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          {sidebarOpen && (
            <div className="mb-3 text-sm">
              <p className="text-slate-400">Usuário</p>
              <p className="text-cyan-400 font-semibold truncate">{user?.name}</p>
            </div>
          )}
          <Button
            onClick={() => logout()}
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-400 hover:bg-red-950 hover:text-red-300"
          >
            <LogOut size={18} />
            {sidebarOpen && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
