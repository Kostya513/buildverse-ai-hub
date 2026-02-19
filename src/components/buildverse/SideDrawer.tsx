import { X, LogIn, Home, Info, Settings, CreditCard, Handshake, Shield, HelpCircle, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onAuthClick: () => void;
  onHomeClick?: () => void;
  onNavigate?: (section: string) => void;
}

const SideDrawer = ({ open, onClose, onAuthClick, onHomeClick, onNavigate }: SideDrawerProps) => {
  const { user } = useAuth();

  if (!open) return null;

  const menuItems = [
    ...(!user
      ? [{ icon: LogIn, label: "Вход / Регистрация", action: "auth" }]
      : [{ icon: User, label: "Мой профиль", action: "profile" }]
    ),
    { icon: Home, label: "Главная", action: "home" },
    { icon: Info, label: "О нас", action: "about" },
    { icon: Settings, label: "Настройки", action: "settings" },
    { icon: CreditCard, label: "Тарифы", action: "tariffs" },
    { icon: Handshake, label: "Партнёры", action: "partners" },
    { icon: Shield, label: "Конфиденциальность", action: "privacy" },
    { icon: HelpCircle, label: "Помощь", action: "help" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-72 z-50 glass-card animate-slide-in-right p-6 flex flex-col gap-1">
        <button onClick={onClose} className="self-end mb-4 text-foreground hover:text-primary transition-colors">
          <X className="w-5 h-5" />
        </button>
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.action === "auth") { onAuthClick(); }
              else if (item.action === "home") { onHomeClick?.(); onClose(); }
              else { onNavigate?.(item.action); }
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-foreground hover:bg-white/10 transition-colors text-left"
          >
            <item.icon className="w-5 h-5 text-primary" />
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

export default SideDrawer;
