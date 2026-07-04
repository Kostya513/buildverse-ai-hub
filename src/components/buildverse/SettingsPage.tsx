import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  User, Shield, CreditCard, Bell, Plug, Users, Lock,
  Save, Loader2, Eye, EyeOff, ChevronRight, Check,
  Palette, Monitor, Sun, Moon, Upload, Trash2, Sparkles,
  Smartphone, Mail, MessageSquare, Globe, FileText, Download,
  Key, AlertTriangle, LogOut, Clock, MapPin,
} from "lucide-react";

/* ═══ ROLE LABELS ═══ */
const roleLabels: Record<string, string> = {
  private: "Частное лицо",
  "self-employed": "Самозанятый",
  ip: "ИП",
  ooo: "ООО / Девелопер",
  supplier: "Поставщик",
  architect: "Архитектор",
};

/* ═══ TAB CONFIG ═══ */
const tabs = [
  { id: "profile", label: "Профиль", icon: User },
  { id: "security", label: "Безопасность", icon: Shield },
  { id: "subscription", label: "Тарифы", icon: CreditCard },
  { id: "notifications", label: "Уведомления", icon: Bell },
  { id: "integrations", label: "Интеграции", icon: Plug },
  { id: "team", label: "Команда", icon: Users },
  { id: "privacy", label: "Данные", icon: Lock },
];

/* ═══ THEME OPTIONS ═══ */
const themes = [
  { id: "light", label: "Светлый", icon: Sun },
  { id: "dark", label: "Тёмный", icon: Moon },
  { id: "system", label: "Системный", icon: Monitor },
];

const accentColors = [
  { id: "emerald", label: "Изумрудный", color: "hsl(168 70% 45%)" },
  { id: "blue", label: "Синий", color: "hsl(217 91% 60%)" },
  { id: "graphite", label: "Графит", color: "hsl(220 9% 46%)" },
  { id: "amber", label: "Янтарный", color: "hsl(38 92% 50%)" },
  { id: "rose", label: "Розовый", color: "hsl(346 77% 50%)" },
];

const densities = [
  { id: "compact", label: "Компактный" },
  { id: "standard", label: "Стандартный" },
  { id: "spacious", label: "Просторный" },
];

/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */
const SettingsCard = ({ title, icon: Icon, badge, children }: {
  title: string; icon: any; badge?: string; children: React.ReactNode;
}) => (
  <div className="glass-card rounded-2xl p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {badge && (
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">{badge}</span>
      )}
    </div>
    {children}
  </div>
);

const Field = ({ label, value, onChange, placeholder, className }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) => (
  <div className={`space-y-1.5 ${className || ""}`}>
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground"
    />
  </div>
);

const ResourceBar = ({ label, used, total, unit }: { label: string; used: number; total: number; unit: string }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{used} / {total} {unit}</span>
    </div>
    <Progress value={(used / total) * 100} className="h-1.5" />
  </div>
);

const VerificationBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; cls: string }> = {
    none: { label: "Не верифицирован", cls: "text-muted-foreground bg-muted/20 border-border" },
    pending: { label: "На проверке", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
    verified: { label: "Подтверждено", cls: "text-primary bg-primary/10 border-primary/20" },
    rejected: { label: "Требуется исправление", cls: "text-destructive bg-destructive/10 border-destructive/20" },
  };
  const c = configs[status] || configs.none;
  return <span className={`text-[10px] px-3 py-1 rounded-full border ${c.cls}`}>{c.label}</span>;
};

/* ═══════════════════════════════════════════
   SECTION: PROFILE & IDENTITY
   ═══════════════════════════════════════════ */
const ProfileSection = () => {
  const { user, profile, refreshProfile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    display_name: "",
    phone: "",
    backup_email: "",
    bio: "",
    inn: "",
    ogrn: "",
    company_name: "",
    kpp: "",
    legal_address: "",
    actual_address: "",
    ceo_name: "",
    bank_name: "",
    bik: "",
    bank_account: "",
    theme: "system",
    accent_color: "emerald",
    ui_density: "standard",
    profile_visibility: "private",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setForm((prev) => ({
        ...prev,
        first_name: (profile as any).first_name || "",
        last_name: (profile as any).last_name || "",
        display_name: profile.display_name || "",
        phone: (profile as any).phone || "",
        backup_email: (profile as any).backup_email || "",
        bio: (profile as any).bio || "",
        inn: profile.inn || "",
        ogrn: profile.ogrn || "",
        company_name: (profile as any).company_name || "",
        kpp: (profile as any).kpp || "",
        legal_address: (profile as any).legal_address || "",
        actual_address: (profile as any).actual_address || "",
        ceo_name: (profile as any).ceo_name || "",
        bank_name: (profile as any).bank_name || "",
        bik: (profile as any).bik || "",
        bank_account: (profile as any).bank_account || "",
        theme: (profile as any).theme || "system",
        accent_color: (profile as any).accent_color || "emerald",
        ui_density: (profile as any).ui_density || "standard",
        profile_visibility: (profile as any).profile_visibility || "private",
      }));
    }
  }, [profile]);

  // Применение темы
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    
    if (form.theme === "dark") {
      root.classList.add("dark");
    } else if (form.theme === "light") {
      root.classList.add("light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(prefersDark ? "dark" : "light");
    }
  }, [form.theme]);

  // Применение акцентного цвета
  useEffect(() => {
    const color = accentColors.find((c) => c.id === form.accent_color);
    if (color) {
      document.documentElement.style.setProperty("--primary", color.color);
    }
  }, [form.accent_color]);

  // Применение плотности интерфейса
  useEffect(() => {
    const root = document.documentElement;
    if (form.ui_density === "compact") {
      root.style.setProperty("--spacing", "0.25rem");
    } else if (form.ui_density === "spacious") {
      root.style.setProperty("--spacing", "1rem");
    } else {
      root.style.setProperty("--spacing", "0.5rem");
    }
  }, [form.ui_density]);

  const update = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  // Загрузка аватара
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Размер файла не должен превышать 5 МБ");
      return;
    }

    setAvatarUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("профили")  // ← ИСПРАВЛЕНО: русское название bucket
        .upload(fileName, file, { 
          cacheControl: "3600",
          upsert: false 
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("профили")  // ← ИСПРАВЛЕНО: русское название bucket
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      toast.success("Аватар обновлён");
    } catch (error) {
      console.error("Ошибка загрузки аватара:", error);
      toast.error("Ошибка загрузки аватара");
    } finally {
      setAvatarUploading(false);
    }
  };

  // Удаление аватара
  const handleAvatarDelete = async () => {
    if (!user) return;
    try {
      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);
      
      await refreshProfile();
      toast.success("Аватар удалён");
    } catch (error) {
      toast.error("Ошибка удаления аватара");
    }
  };

  // Смена роли
  const handleRoleChange = async (newRole: string) => {
    if (!user) return;
    try {
      await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("user_id", user.id);
      
      await refreshProfile();
      toast.success("Роль изменена");
    } catch (error) {
      toast.error("Ошибка смены роли");
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        display_name: form.display_name || null,
        phone: form.phone || null,
        backup_email: form.backup_email || null,
        bio: form.bio || null,
        inn: form.inn || null,
        ogrn: form.ogrn || null,
        company_name: form.company_name || null,
        kpp: form.kpp || null,
        legal_address: form.legal_address || null,
        actual_address: form.actual_address || null,
        ceo_name: form.ceo_name || null,
        bank_name: form.bank_name || null,
        bik: form.bik || null,
        bank_account: form.bank_account || null,
        theme: form.theme,
        accent_color: form.accent_color,
        ui_density: form.ui_density,
        profile_visibility: form.profile_visibility,
      } as any)
      .eq("user_id", user.id);
    if (error) toast.error("Ошибка сохранения");
    else {
      toast.success("Профиль обновлён");
      await refreshProfile();
    }
    setSaving(false);
  };

  const isBusinessRole = profile?.role === "ip" || profile?.role === "ooo" || profile?.role === "supplier";
  const isProfessional = profile?.role === "architect" || profile?.role === "self-employed";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Personal Data */}
      <SettingsCard title="Личные данные" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Имя" value={form.first_name} onChange={(v) => update("first_name", v)} />
          <Field label="Фамилия" value={form.last_name} onChange={(v) => update("last_name", v)} />
          <Field label="Отображаемое имя" value={form.display_name} onChange={(v) => update("display_name", v)} />
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2">
              <Input value={user?.email || ""} disabled className="bg-white/5 border-border text-foreground opacity-60" />
              <span className="text-primary text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Подтверждён</span>
            </div>
          </div>
          <Field label="Телефон" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+7 (___) ___-__-__" />
          <Field label="Резервный Email" value={form.backup_email} onChange={(v) => update("backup_email", v)} />
        </div>
      </SettingsCard>

      {/* Avatar & Theme */}
      <SettingsCard title="Аватар и оформление" icon={Palette}>
        <div className="flex items-center gap-4 mb-4">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary border-2 border-primary/30">
              {(form.display_name || user?.email || "?").slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-border text-foreground hover:bg-accent/20"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                Загрузить
              </Button>
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 mr-1" /> AI-аватар
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-destructive"
                onClick={handleAvatarDelete}
                disabled={!profile?.avatar_url}
              >
                <Trash2 className="w-3 h-3 mr-1" /> Удалить
              </Button>
            </div>
          </div>
        </div>

        {/* Theme */}
        <Label className="text-xs text-muted-foreground mb-2 block">Тема оформления</Label>
        <div className="flex gap-2 mb-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => update("theme", t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs transition-all border ${
                form.theme === t.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Accent Color */}
        <Label className="text-xs text-muted-foreground mb-2 block">Акцентный цвет</Label>
        <div className="flex gap-2 mb-4">
          {accentColors.map((c) => (
            <button
              key={c.id}
              onClick={() => update("accent_color", c.id)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${
                form.accent_color === c.id ? "border-foreground scale-110" : "border-transparent"
              }`}
              style={{ backgroundColor: c.color }}
              title={c.label}
            />
          ))}
        </div>

        {/* UI Density */}
        <Label className="text-xs text-muted-foreground mb-2 block">Плотность интерфейса</Label>
        <div className="flex gap-2">
          {densities.map((d) => (
            <button
              key={d.id}
              onClick={() => update("ui_density", d.id)}
              className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                form.ui_density === d.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </SettingsCard>

      {/* Role */}
      <SettingsCard title="Роль и верификация" icon={FileText}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Текущая роль</Label>
            <div className="flex items-center gap-3">
              <select
                value={profile?.role || "private"}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="flex-1 bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-foreground"
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <span className="text-xs text-muted-foreground">
                {roleLabels[profile?.role || "private"]}
              </span>
            </div>
          </div>
          <VerificationBadge status={(profile as any)?.verification_status || "none"} />
        </div>
      </SettingsCard>

      {/* Business Fields */}
      {isBusinessRole && (
        <SettingsCard title="Реквизиты организации" icon={FileText}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Название организации" value={form.company_name} onChange={(v) => update("company_name", v)} />
            <Field label="ИНН" value={form.inn} onChange={(v) => update("inn", v)} />
            <Field label="КПП" value={form.kpp} onChange={(v) => update("kpp", v)} />
            <Field label="ОГРН" value={form.ogrn} onChange={(v) => update("ogrn", v)} />
            <Field label="Юридический адрес" value={form.legal_address} onChange={(v) => update("legal_address", v)} className="sm:col-span-2" />
            <Field label="Фактический адрес" value={form.actual_address} onChange={(v) => update("actual_address", v)} className="sm:col-span-2" />
            <Field label="ФИО Руководителя" value={form.ceo_name} onChange={(v) => update("ceo_name", v)} />
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Label className="text-xs text-muted-foreground mb-2 block">Банковские данные</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Банк" value={form.bank_name} onChange={(v) => update("bank_name", v)} />
              <Field label="БИК" value={form.bik} onChange={(v) => update("bik", v)} />
              <Field label="Расчётный счёт" value={form.bank_account} onChange={(v) => update("bank_account", v)} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <Label className="text-xs text-muted-foreground mb-2 block">Документы</Label>
            <div className="glass-card rounded-xl p-4 border border-dashed border-border text-center">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Перетащите файлы или нажмите для загрузки</p>
              <p className="text-[10px] text-muted-foreground/60 mt-1">PDF, JPG, PNG до 10 МБ</p>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Professional Profile */}
      {isProfessional && (
        <SettingsCard title="Профессиональный профиль" icon={Sparkles}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">О себе</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Расскажите о вашей специализации и опыте..."
                className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Портфолио (ссылки)</Label>
              <Input placeholder="https://behance.net/..." className="bg-white/5 border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div className="glass-card rounded-xl p-4 border border-dashed border-border text-center">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Загрузить сертификаты и дипломы</p>
            </div>
          </div>
        </SettingsCard>
      )}

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Сохранить изменения
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SECTION: SECURITY
   ═══════════════════════════════════════════ */
const SecuritySection = () => {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changing, setChanging] = useState(false);

  const pwStrength = (() => {
    if (newPw.length === 0) return 0;
    let s = 0;
    if (newPw.length >= 8) s += 25;
    if (/[A-Z]/.test(newPw)) s += 25;
    if (/[0-9]/.test(newPw)) s += 25;
    if (/[^A-Za-z0-9]/.test(newPw)) s += 25;
    return s;
  })();

  const handleChange = async () => {
    if (newPw !== confirmPw) { toast.error("Пароли не совпадают"); return; }
    if (newPw.length < 8) { toast.error("Минимум 8 символов"); return; }
    setChanging(true);
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) toast.error(error.message);
    else { toast.success("Пароль изменён"); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }
    setChanging(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsCard title="Управление паролем" icon={Key}>
        <div className="space-y-3 max-w-md">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Текущий пароль</Label>
            <div className="relative">
              <Input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
                className="bg-white/5 border-border text-foreground pr-10" />
              <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Новый пароль</Label>
            <Input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)}
              className="bg-white/5 border-border text-foreground" />
            {newPw && (
              <div className="space-y-1">
                <Progress value={pwStrength} className="h-1.5" />
                <p className={`text-[10px] ${pwStrength >= 75 ? "text-primary" : pwStrength >= 50 ? "text-yellow-400" : "text-destructive"}`}>
                  {pwStrength >= 75 ? "Надёжный" : pwStrength >= 50 ? "Средний" : "Слабый"}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Подтвердите пароль</Label>
            <Input type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              className="bg-white/5 border-border text-foreground" />
          </div>
          <Button onClick={handleChange} disabled={changing} className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
            {changing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Изменить пароль
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Активные сессии" icon={Monitor}>
        <div className="space-y-3">
          <div className="glass-card rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-foreground">Текущий браузер</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Текущая сессия
                  <Clock className="w-3 h-3 ml-2" /> Сейчас
                </p>
              </div>
            </div>
            <span className="text-[10px] text-primary px-2 py-0.5 rounded-full bg-primary/10">Активна</span>
          </div>
          <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut className="w-3 h-3 mr-1" /> Выйти на всех устройствах
          </Button>
        </div>
      </SettingsCard>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SECTION: SUBSCRIPTION
   ═══════════════════════════════════════════ */
const SubscriptionSection = () => {
  const plans = [
    { id: "free", name: "Free", price: "0 ₽/мес", features: ["5 AI-запросов/день", "1 проект", "100 МБ хранилище"], current: true },
    { id: "pro", name: "Pro", price: "1 990 ₽/мес", features: ["100 AI-запросов/день", "10 проектов", "10 ГБ хранилище", "BIM-генерация"], current: false },
    { id: "business", name: "Business", price: "9 990 ₽/мес", features: ["Безлимит AI", "Безлимит проектов", "100 ГБ хранилище", "Команда до 25 чел."], current: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsCard title="Текущий тариф" icon={CreditCard}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-lg font-bold text-primary">Free</p>
            <p className="text-xs text-muted-foreground">Бесплатный план</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Активен</span>
        </div>
        <div className="space-y-3">
          <ResourceBar label="AI-запросы" used={3} total={5} unit="запросов" />
          <ResourceBar label="Хранилище" used={12} total={100} unit="МБ" />
          <ResourceBar label="Проекты" used={1} total={1} unit="" />
        </div>
      </SettingsCard>

      <SettingsCard title="Доступные планы" icon={Sparkles}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass-card rounded-xl p-4 border transition-all ${plan.current ? "border-primary" : "border-border hover:border-primary/30"}`}>
              <p className="text-sm font-bold text-foreground">{plan.name}</p>
              <p className="text-lg font-bold text-primary mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                className={`w-full mt-3 text-xs ${plan.current
                  ? "bg-primary/10 text-primary border border-primary/20 pointer-events-none"
                  : "bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"}`}
              >
                {plan.current ? "Текущий" : "Выбрать"}
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SECTION: NOTIFICATIONS
   ═══════════════════════════════════════════ */
const NotificationsSection = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState({
    email_system: true,
    email_security: true,
    email_projects: true,
    email_finance: true,
    email_marketing: false,
    push_enabled: false,
    sms_security: false,
    digest_frequency: "daily",
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setPrefs({
            email_system: (data as any).email_system ?? true,
            email_security: (data as any).email_security ?? true,
            email_projects: (data as any).email_projects ?? true,
            email_finance: (data as any).email_finance ?? true,
            email_marketing: (data as any).email_marketing ?? false,
            push_enabled: (data as any).push_enabled ?? false,
            sms_security: (data as any).sms_security ?? false,
            digest_frequency: (data as any).digest_frequency ?? "daily",
          });
        }
        setLoaded(true);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...prefs } as any, { onConflict: "user_id" });
    if (error) toast.error("Ошибка сохранения");
    else toast.success("Настройки уведомлений сохранены");
    setSaving(false);
  };

  const toggle = (key: string) => setPrefs((p) => ({ ...p, [key]: !(p as any)[key] }));

  const notifGroups = [
    { title: "Email", icon: Mail, items: [
      { key: "email_system", label: "Системные", desc: "Обновления платформы, технические работы" },
      { key: "email_security", label: "Безопасность", desc: "Входы, смена пароля" },
      { key: "email_projects", label: "Проекты", desc: "Завершение генерации, приглашения" },
      { key: "email_finance", label: "Финансы", desc: "Оплата, лимиты" },
      { key: "email_marketing", label: "Маркетинг", desc: "Новости, предложения, вебинары" },
    ]},
    { title: "Push-уведомления", icon: Bell, items: [
      { key: "push_enabled", label: "Браузерные уведомления", desc: "Уведомления в браузере" },
    ]},
    { title: "SMS", icon: Smartphone, items: [
      { key: "sms_security", label: "Критические события", desc: "Безопасность и платежи" },
    ]},
  ];

  const frequencies = [
    { id: "instant", label: "Мгновенно" },
    { id: "daily", label: "Ежедневно" },
    { id: "weekly", label: "Еженедельно" },
    { id: "never", label: "Никогда" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {notifGroups.map((group) => (
        <SettingsCard key={group.title} title={group.title} icon={group.icon}>
          <div className="space-y-3">
            {group.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={(prefs as any)[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </SettingsCard>
      ))}

      <SettingsCard title="Частота дайджестов" icon={Clock}>
        <div className="flex gap-2">
          {frequencies.map((f) => (
            <button
              key={f.id}
              onClick={() => setPrefs((p) => ({ ...p, digest_frequency: f.id }))}
              className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                prefs.digest_frequency === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </SettingsCard>

      <Button onClick={handleSave} disabled={saving} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Сохранить настройки
      </Button>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SECTION: INTEGRATIONS
   ═══════════════════════════════════════════ */
const IntegrationsSection = () => {
  const integrations = [
    { name: "Google Drive", icon: Globe, connected: false },
    { name: "Dropbox", icon: Globe, connected: false },
    { name: "Telegram", icon: MessageSquare, connected: false },
    { name: "Slack", icon: MessageSquare, connected: false },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsCard title="Подключённые сервисы" icon={Plug}>
        <div className="space-y-3">
          {integrations.map((int) => (
            <div key={int.name} className="glass-card rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <int.icon className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm text-foreground">{int.name}</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs border-border text-muted-foreground hover:text-primary">
                Подключить
              </Button>
            </div>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
};

/* ═══════════════════════════════════════════
   SECTION: TEAM
   ═══════════════════════════════════════════ */
const TeamSection = () => (
  <div className="space-y-6 animate-fade-in">
    <SettingsCard title="Участники команды" icon={Users} badge="Business+">
      <div className="text-center py-8">
        <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-foreground font-medium">Командная работа</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Приглашайте коллег, назначайте роли и управляйте доступом к проектам. Доступно на тарифах Business и Enterprise.
        </p>
        <Button className="mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs">
          Перейти на Business
        </Button>
      </div>
    </SettingsCard>
  </div>
);

/* ═══════════════════════════════════════════
   SECTION: DATA & PRIVACY
   ═══════════════════════════════════════════ */
const PrivacyDataSection = () => {
  const { user } = useAuth();
  const [visibility, setVisibility] = useState("private");
  const visibilities = [
    { id: "private", label: "Приватный" },
    { id: "public", label: "Публичный" },
    { id: "partners", label: "Только для партнёров" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <SettingsCard title="Экспорт данных" icon={Download}>
        <p className="text-xs text-muted-foreground mb-3">Сформируйте архив всех ваших данных: профиль, проекты, переписки, платежи.</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-xs border-border text-foreground hover:text-primary">
            <Download className="w-3 h-3 mr-1" /> JSON
          </Button>
          <Button size="sm" variant="outline" className="text-xs border-border text-foreground hover:text-primary">
            <Download className="w-3 h-3 mr-1" /> CSV
          </Button>
          <Button size="sm" variant="outline" className="text-xs border-border text-foreground hover:text-primary">
            <Download className="w-3 h-3 mr-1" /> PDF
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard title="Видимость профиля" icon={Eye}>
        <div className="flex gap-2">
          {visibilities.map((v) => (
            <button
              key={v.id}
              onClick={() => setVisibility(v.id)}
              className={`px-4 py-2 rounded-xl text-xs transition-all border ${
                visibility === v.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-accent/10"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard title="Удаление данных" icon={AlertTriangle}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground">Деактивация аккаунта</p>
              <p className="text-[10px] text-muted-foreground">Временное отключение с возможностью восстановления (30 дней)</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              Деактивировать
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-destructive">Полное удаление</p>
              <p className="text-[10px] text-muted-foreground">Безвозвратное удаление всех данных</p>
            </div>
            <Button size="sm" variant="outline" className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10">
              Удалить аккаунт
            </Button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
};

/* ═══════════════════════════════════════════
   MAIN SETTINGS PAGE
   ═══════════════════════════════════════════ */
const SettingsPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  if (!user) {
    return (
      <div className="text-center py-12">
        <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">Войдите, чтобы открыть настройки</p>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeTab) {
      case "profile": return <ProfileSection />;
      case "security": return <SecuritySection />;
      case "subscription": return <SubscriptionSection />;
      case "notifications": return <NotificationsSection />;
      case "integrations": return <IntegrationsSection />;
      case "team": return <TeamSection />;
      case "privacy": return <PrivacyDataSection />;
      default: return <ProfileSection />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-3 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs whitespace-nowrap transition-all border ${
              activeTab === tab.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-transparent text-muted-foreground hover:bg-accent/10 hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div className="max-w-2xl">
        {renderSection()}
      </div>
    </div>
  );
};

export default SettingsPage;