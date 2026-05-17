import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Download } from "lucide-react";
import { notify } from "@/lib/notify";

interface ExportModelModalProps {
  open: boolean;
  format: "IFC" | "RVT" | "DWG";
  onOpenChange: (v: boolean) => void;
}

export const ExportModelModal = ({ open, format, onOpenChange }: ExportModelModalProps) => {
  const [lod, setLod] = useState("300");
  const [units, setUnits] = useState("mm");
  const [includeMeta, setIncludeMeta] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    setBusy(true);
    const payload = {
      format,
      generated_at: new Date().toISOString(),
      settings: { lod, units, includeMeta },
      mock_model: {
        elements: [
          { id: "F-001", type: "Foundation", material: "Concrete" },
          { id: "W-001", type: "Wall", material: "Brick" },
          { id: "R-001", type: "Roof", material: "Tile" },
        ],
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `buildverse-model.${format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    notify.success(`Модель экспортирована в ${format}`);
    setBusy(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background/90 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle>Экспорт модели в {format}</DialogTitle>
          <DialogDescription>Настройте параметры и скачайте файл.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Уровень детализации (LOD)</Label>
            <Select value={lod} onValueChange={setLod}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="100">LOD 100 — концепция</SelectItem>
                <SelectItem value="200">LOD 200 — общая геометрия</SelectItem>
                <SelectItem value="300">LOD 300 — детализация</SelectItem>
                <SelectItem value="400">LOD 400 — производство</SelectItem>
                <SelectItem value="500">LOD 500 — as-built</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Единицы измерения</Label>
            <Select value={units} onValueChange={setUnits}>
              <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mm">Миллиметры</SelectItem>
                <SelectItem value="cm">Сантиметры</SelectItem>
                <SelectItem value="m">Метры</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <Checkbox checked={includeMeta} onCheckedChange={(v) => setIncludeMeta(!!v)} />
            Включить метаданные элементов
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Отмена</Button>
          <Button onClick={handleDownload} disabled={busy} className="gap-1.5">
            <Download className="w-4 h-4" />
            {busy ? "Подготовка..." : "Скачать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModelModal;
