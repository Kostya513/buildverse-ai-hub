import { useState } from "react";
import { X, User, Briefcase, Building2, Truck, PenTool, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const roles = [
  { id: "private", label: "Частное лицо", hint: "Дом, дача, малый объект", icon: User },
  { id: "self-employed", label: "Самозанятый", hint: "Фриланс-специалист", icon: Briefcase },
  { id: "ip", label: "ИП", hint: "Несколько объектов, тендеры, сметы", icon: Briefcase },
  { id: "ooo", label: "ООО / Девелопер", hint: "Несколько объектов, тендеры, сметы", icon: Building2 },
  { id: "supplier", label: "Поставщик", hint: "Продажа материалов и услуг", icon: Truck },
  { id: "architect", label: "Архитектор", hint: "Проекты, портфолио, заказчики", icon: PenTool },
];

type Step = "choice" | "login" | "form" | "success";

const AuthModal = ({ open, onClose }: AuthModalProps) => {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<Step>("choice");
  const [selectedRole, setSelectedRole] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inn, setInn] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep("choice"); setSelectedRole(""); setEmail(""); setPassword(""); setConfirm(""); setInn(""); setLoading(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleLogin = async () => {
    if (!email || !password) { toast.error("Заполните все поля"); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Вы вошли в систему!");
    handleClose();
  };

  const handleRegister = async () => {
    if (!email || !password) { toast.error("Заполните все поля"); return; }
    if (password !== confirm) { toast.error("Пароли не совпадают"); return; }
    if (password.length < 6) { toast.error("Пароль минимум 6 символов"); return; }
    setLoading(true);
    const { error } = await signUp(email, password, selectedRole, { inn: inn || undefined });
    setLoading(false);
    if (error) { toast.error(error); return; }
    setStep("success");
  };

  const roleObj = roles.find((r) => r.id === selectedRole);
  const needsInn = selectedRole === "ip" || selectedRole === "ooo";

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-6 w-full max-w-md animate-scale-in relative max-h-[90vh] overflow-y-auto scrollbar-none">
          <button onClick={handleClose} className="absolute top-4 right-4 text-foreground hover:text-primary">
            <X className="w-5 h-5" />
          </button>

          {step === "login" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-foreground text-center">Вход в BUILDVERSE</h2>
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
              <Input placeholder="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
              <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" onClick={handleLogin} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <button className="text-primary hover:underline" onClick={() => setStep("choice")}>Регистрация</button>
              </p>
            </div>
          )}

          {step === "choice" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-foreground text-center">Кто вы?</h2>
              <p className="text-sm text-muted-foreground text-center">Выберите вашу роль</p>
              <div className="grid grid-cols-2 gap-2">
                {roles.map((role) => (
                  <button key={role.id} onClick={() => setSelectedRole(role.id)}
                    className={`glass-card rounded-xl p-3 text-left transition-all hover:scale-[1.02] ${
                      selectedRole === role.id ? "border-primary/50 glass-glow" : ""
                    }`}>
                    <role.icon className={`w-5 h-5 mb-1 ${selectedRole === role.id ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-sm font-medium text-foreground">{role.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{role.hint}</p>
                  </button>
                ))}
              </div>
              <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" disabled={!selectedRole}
                onClick={() => setStep("form")}>
                Далее <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <button className="text-primary hover:underline" onClick={() => setStep("login")}>Войти</button>
              </p>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-bold text-foreground text-center">Регистрация</h2>
              <p className="text-sm text-muted-foreground text-center">
                Роль: <span className="text-primary">{roleObj?.label}</span>
              </p>
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
              <Input placeholder="Пароль (мин. 6 символов)" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
              <Input placeholder="Подтверждение пароля" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
              {needsInn && (
                <Input placeholder="ИНН / ОГРН (необязательно)" value={inn} onChange={(e) => setInn(e.target.value)}
                  className="bg-white/10 border-white/20 text-foreground placeholder:text-muted-foreground" />
              )}
              <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" onClick={handleRegister} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Зарегистрироваться"}
              </Button>
              <button className="text-sm text-muted-foreground hover:text-foreground w-full text-center" onClick={() => setStep("choice")}>
                ← Назад к выбору роли
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-5 animate-fade-in text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Проверьте почту!</h2>
              <p className="text-sm text-muted-foreground">
                Мы отправили письмо для подтверждения на <span className="text-primary">{email}</span>.
                После подтверждения вы сможете войти в систему.
              </p>
              <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground" onClick={handleClose}>
                Понятно
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuthModal;
