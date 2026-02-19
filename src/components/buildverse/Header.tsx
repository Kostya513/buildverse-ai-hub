import { useState, useRef, useEffect } from "react";
import { Menu, LogIn, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import SideDrawer from "./SideDrawer";
import AuthModal from "./AuthModal";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onHomeClick?: () => void;
  onNavigate?: (section: string) => void;
}

const Header = ({ onHomeClick, onNavigate }: HeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() || "?";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card h-14 flex items-center justify-between px-4 md:px-6">
        <h1 className="text-xl font-black tracking-wider text-foreground cursor-pointer" onClick={onHomeClick}>
          BUILD<span className="text-primary">VERSE</span>
        </h1>

        <div className="flex items-center gap-2">
          {!user ? (
            <Button variant="ghost" size="sm"
              className="hidden sm:flex text-foreground hover:bg-white/10"
              onClick={() => setAuthOpen(true)}>
              <LogIn className="w-4 h-4 mr-1" /> Вход
            </Button>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary">
                  {initials}
                </div>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 glass-card rounded-xl p-1.5 min-w-[160px] z-50 space-y-0.5">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
                    <p className="text-[10px] text-primary">{profile?.role || "user"}</p>
                  </div>
                  <button onClick={() => { setDropdownOpen(false); onNavigate?.("profile"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-colors">
                    <User className="w-4 h-4 text-muted-foreground" /> Профиль
                  </button>
                  <button onClick={() => { setDropdownOpen(false); onNavigate?.("settings"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-white/10 transition-colors">
                    <Settings className="w-4 h-4 text-muted-foreground" /> Настройки
                  </button>
                  <button onClick={() => { setDropdownOpen(false); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-white/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Выйти
                  </button>
                </div>
              )}
            </div>
          )}
          <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/10"
            onClick={() => setDrawerOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAuthClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
        onHomeClick={onHomeClick}
        onNavigate={(section) => { setDrawerOpen(false); onNavigate?.(section); }}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
