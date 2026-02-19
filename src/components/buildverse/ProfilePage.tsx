import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const roleLabels: Record<string, string> = {
  private: "Частное лицо",
  "self-employed": "Самозанятый",
  ip: "ИП",
  ooo: "ООО / Девелопер",
  supplier: "Поставщик",
  architect: "Архитектор",
};

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [inn, setInn] = useState(profile?.inn || "");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  if (!user || !profile) {
    return <p className="text-muted-foreground text-sm text-center py-8">Войдите, чтобы увидеть профиль</p>;
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, inn: inn || null })
      .eq("user_id", user.id);
    if (error) toast.error("Ошибка сохранения");
    else { toast.success("Профиль обновлён"); await refreshProfile(); }
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) { toast.error("Минимум 6 символов"); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("Пароль изменён"); setNewPassword(""); }
  };

  return (
    <div className="animate-fade-in space-y-4 max-w-md">
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Профиль</h3>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Email</Label>
          <p className="text-sm text-foreground">{user.email}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Роль</Label>
          <p className="text-sm text-primary">{roleLabels[profile.role] || profile.role}</p>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Имя</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="bg-white/5 border-white/10 text-foreground" />
        </div>
        {(profile.role === "ip" || profile.role === "ooo") && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">ИНН / ОГРН</Label>
            <Input value={inn} onChange={(e) => setInn(e.target.value)}
              className="bg-white/5 border-white/10 text-foreground" />
          </div>
        )}
        <Button onClick={handleSave} disabled={saving} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Сохранить</>}
        </Button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Сменить пароль</h3>
        <Input type="password" placeholder="Новый пароль" value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="bg-white/5 border-white/10 text-foreground placeholder:text-muted-foreground" />
        <Button onClick={handlePasswordChange} className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
          Изменить пароль
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
