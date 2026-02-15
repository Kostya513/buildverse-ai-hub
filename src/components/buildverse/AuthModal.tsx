import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 w-full max-w-sm animate-scale-in relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-foreground hover:text-primary">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Вход в BUILDVERSE</h2>
          <div className="space-y-4">
            <Input placeholder="Email" type="email" className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
            <Input placeholder="Пароль" type="password" className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
            <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground">Войти</Button>
            <p className="text-center text-sm text-muted-foreground">
              Нет аккаунта? <button className="text-primary hover:underline">Регистрация</button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
