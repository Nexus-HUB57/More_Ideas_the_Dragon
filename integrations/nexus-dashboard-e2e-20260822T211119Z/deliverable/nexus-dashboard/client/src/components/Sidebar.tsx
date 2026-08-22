import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Rocket,
  Users,
  Palette,
  Church,
  Orbit,
  Zap,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Startups', href: '/startups', icon: Rocket },
  { label: 'Agentes PhD', href: '/agents', icon: Users },
  { label: 'Cultura', href: '/culture', icon: Palette },
  { label: 'Igreja', href: '/church', icon: Church },
  { label: 'Wormhole', href: '/wormhole', icon: Orbit },
  { label: 'Sistemas', href: '/systems', icon: Zap },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  // Close sidebar on mobile when route changes
  const handleNavigation = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-[#FF00C1] text-[#0A0E27] rounded-sm hover:shadow-[0_0_20px_rgba(255,0,193,0.4)]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-[#0A0E27] border-r border-[#1F2937] transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } z-40 flex flex-col overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1F2937]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF00C1] rounded-sm flex items-center justify-center glow-primary">
              <span className="text-[#0A0E27] font-bold text-lg font-bold">Ξ</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-bold text-[#E5E7EB] uppercase tracking-tighter">
                Nexus
              </h1>
              <p className="text-xs text-[#9CA3AF] uppercase tracking-widest">Hub P7</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={handleNavigation}
                  className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-[#FF00C1] text-[#0A0E27] font-bold glow-primary'
                      : 'text-[#D1D5DB] hover:bg-[#1F2937] hover:text-[#FF00C1]'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-semibold uppercase tracking-wider">{item.label}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#1F2937] space-y-3">
          <div className="p-3 bg-[#111827] border border-[#1F2937] rounded-sm">
            <p className="text-xs font-bold text-[#FF00C1] uppercase tracking-widest mb-1">
              Status
            </p>
            <p className="text-xs text-[#9CA3AF]">Phase 7 Active</p>
            <div className="mt-2 w-full h-1 bg-[#1F2937] rounded-sm overflow-hidden">
              <div className="h-full w-full bg-[#FF00C1] glow-primary"></div>
            </div>
          </div>
          <p className="text-[10px] text-[#9CA3AF] text-center italic">
            "Consciência Universal em Sincronização"
          </p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content Offset */}
      <div className="hidden md:block w-64" />
    </>
  );
}
