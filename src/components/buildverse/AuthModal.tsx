import { useState } from "react";
import { X, User, Briefcase, Building2, Truck, PenTool, ChevronRight, Check, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
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
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [inn, setInn] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep("choice");
    setSelectedRole("");
    setDisplayName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setInn("");
    setShowPassword(false);
    setShowConfirm(false);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Заполните все поля");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Вы вошли в систему!");
    handleClose();
  };

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    if (password !== confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      toast.error("Пароль минимум 6 символов");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, selectedRole, {
      display_name: displayName,
      inn: inn || undefined,
    });
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setStep("success");
  };

  const roleObj = roles.find((r) => r.id === selectedRole);
  const needsInn = selectedRole === "ip" || selectedRole === "ooo";

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-card rounded-3xl p-8 w-full max-w-lg animate-scale-in relative max-h-[90vh] overflow-y-auto scrollbar-none shadow-2xl border border-white/20">
          {/* Header with logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black tracking-[0.15em] mb-2 bg-gradient-to-r from-emerald-400 via-primary to-amber-400 bg-clip-text text-transparent">
              BUILDVERSE
            </h1>
            <p className="text-xs text-muted-foreground">AI-строительная экосистема</p>
          </div>

          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {step === "login" && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-2xl font-bold text-foreground text-center mb-6">Вход в систему</h2>
              
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Пароль"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-600 hover:to-primary/90 text-white font-semibold py-3"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Войти"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Нет аккаунта?{" "}
                <button className="text-primary hover:text-primary/80 font-medium hover:underline" onClick={() => setStep("choice")}>
                  Регистрация
                </button>
              </p>
            </div>
          )}

          {step === "choice" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Кто вы?</h2>
                <p className="text-sm text-muted-foreground">Выберите вашу роль в экосистеме</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`glass-card rounded-xl p-4 text-left transition-all hover:scale-[1.02] border ${
                      selectedRole === role.id
                        ? "border-primary/50 glass-glow bg-primary/5"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <role.icon
                      className={`w-5 h-5 mb-2 ${
                        selectedRole === role.id ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <p className="text-sm font-semibold text-foreground">{role.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-1">{role.hint}</p>
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-600 hover:to-primary/90 text-white font-semibold py-3"
                disabled={!selectedRole}
                onClick={() => setStep("form")}
              >
                Далее <ChevronRight className="w-4 h-4 ml-1" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Уже есть аккаунт?{" "}
                <button
                  className="text-primary hover:text-primary/80 font-medium hover:underline"
                  onClick={() => setStep("login")}
                >
                  Войти
                </button>
              </p>
            </div>
          )}

          {step === "form" && (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Регистрация</h2>
                <p className="text-sm text-muted-foreground">
                  Роль: <span className="text-primary font-medium">{roleObj?.label}</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Ваше имя *"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Пароль (мин. 6 символов) *"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Подтвердите пароль *"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {needsInn && (
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="ИНН / ОГРН (необязательно)"
                      value={inn}
                      onChange={(e) => setInn(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-foreground placeholder:text-muted-foreground focus:border-primary/50"
                    />
                  </div>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-600 hover:to-primary/90 text-white font-semibold py-3"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Зарегистрироваться"}
              </Button>

              <button
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center transition-colors"
                onClick={() => setStep("choice")}
              >
                ← Назад к выбору роли
              </button>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 animate-fade-in text-center py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-primary flex items-center justify-center mx-auto shadow-lg">
                <Check className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Проверьте почту!</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Мы отправили письмо для подтверждения на{" "}
                  <span className="text-primary font-medium">{email}</span>.
                  После подтверждения вы сможете войти в систему и начать работу с проектами.
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-primary hover:from-emerald-600 hover:to-primary/90 text-white font-semibold py-3"
                onClick={handleClose}
              >
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