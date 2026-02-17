import { useState } from "react";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import SideDrawer from "./SideDrawer";
import AuthModal from "./AuthModal";

interface HeaderProps {
  onHomeClick?: () => void;
}

const Header = ({ onHomeClick }: HeaderProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card h-14 flex items-center justify-between px-4 md:px-6">
        <h1
          className="text-xl font-black tracking-wider text-foreground cursor-pointer"
          onClick={onHomeClick}
        >
          BUILD<span className="text-primary">VERSE</span>
        </h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:flex text-foreground hover:bg-white/10"
            onClick={() => setAuthOpen(true)}
          >
            <LogIn className="w-4 h-4 mr-1" />
            Вход
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-white/10"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onAuthClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
        onHomeClick={onHomeClick}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
