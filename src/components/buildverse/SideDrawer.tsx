import { X, LogIn, Home, Info, Settings, CreditCard, Handshake, Shield, HelpCircle } from "lucide-react";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  onAuthClick: () => void;
  onHomeClick?: () => void;
}

const menuItems = [
  { icon: LogIn, label: "Вход/Регистрация", action: "auth" },
  { icon: Home, label: "Главная", action: "home" },
  { icon: Info, label: "О нас" },
  { icon: Settings, label: "Настройки" },
  { icon: CreditCard, label: "Тарифы" },
  { icon: Handshake, label: "Партнёры" },
  { icon: Shield, label: "Конфиденциальность" },
  { icon: HelpCircle, label: "Помощь" },
];

const SideDrawer = ({ open, onClose, onAuthClick, onHomeClick }: SideDrawerProps) => {
  if (!open) return null;

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
              else { onClose(); }
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
