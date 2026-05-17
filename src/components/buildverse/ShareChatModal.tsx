import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check } from "lucide-react";
import { notify } from "@/lib/notify";

interface ShareChatModalProps {
  open: boolean;
  chatId: string | null;
  onOpenChange: (v: boolean) => void;
}

export const ShareChatModal = ({ open, chatId, onOpenChange }: ShareChatModalProps) => {
  const [access, setAccess] = useState("view");
  const [copied, setCopied] = useState(false);

  const link = chatId
    ? `${window.location.origin}/share/chat/${chatId}?access=${access}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      notify.success("Ссылка скопирована");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify.error("Не удалось скопировать ссылку");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/90 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Поделиться чатом</DialogTitle>
          <DialogDescription>Скопируйте ссылку и настройте уровень доступа.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Уровень доступа</Label>
            <Select value={access} onValueChange={setAccess}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="view">Только просмотр</SelectItem>
                <SelectItem value="comment">Можно комментировать</SelectItem>
                <SelectItem value="edit">Полный доступ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Input value={link} readOnly className="bg-white/5 border-white/10 text-xs" />
            <Button onClick={handleCopy} variant="secondary" className="shrink-0 gap-1.5">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Готово" : "Копия"}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Закрыть</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareChatModal;
