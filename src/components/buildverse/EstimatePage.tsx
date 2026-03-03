import { useState } from "react";
import {
  RefreshCw, PenLine, FileSpreadsheet, Share2, Save, ChevronDown, ChevronRight,
  ShoppingCart, MessageSquare, Trash2, Lock, Unlock, AlertTriangle,
  CheckCircle2, Clock, Search, Sparkles, ArrowLeft, Layers,
  Download, Bot, Plus, GitCompare, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/* ───── ESTIMATE DATA ───── */
interface EstimateItem {
  id: string;
  name: string;
  volume: string;
  unit: string;
  price: number;
  status: "available" | "no-price" | "updating";
  locked: boolean;
  comment?: string;
}

interface EstimateSection {
  id: string;
  title: string;
  items: EstimateItem[];
}

const initialSections: EstimateSection[] = [
  {
    id: "prep",
    title: "Подготовительные работы",
    items: [
      { id: "p1", name: "Геодезическая съёмка", volume: "1", unit: "комп.", price: 45000, status: "available", locked: false },
      { id: "p2", name: "Вынос осей", volume: "1", unit: "комп.", price: 15000, status: "available", locked: false },
      { id: "p3", name: "Планировка участка", volume: "800", unit: "м²", price: 120000, status: "available", locked: false },
    ],
  },
  {
    id: "foundation",
    title: "Фундамент",
    items: [
      { id: "f1", name: "Бетон М300", volume: "15", unit: "м³", price: 75000, status: "available", locked: false },
      { id: "f2", name: "Арматура А500С ø12", volume: "2.1", unit: "т", price: 101850, status: "available", locked: false },
      { id: "f3", name: "Опалубка", volume: "48", unit: "м²", price: 96000, status: "no-price", locked: false },
      { id: "f4", name: "Гидроизоляция", volume: "120", unit: "м²", price: 54000, status: "available", locked: false },
    ],
  },
  {
    id: "walls",
    title: "Коробка (стены и перекрытия)",
    items: [
      { id: "w1", name: "Газобетон D500 600×250×200", volume: "42", unit: "м³", price: 252000, status: "available", locked: false },
      { id: "w2", name: "Кладочная смесь", volume: "120", unit: "мешк.", price: 48000, status: "available", locked: false },
      { id: "w3", name: "Плиты перекрытия ПК", volume: "12", unit: "шт.", price: 180000, status: "updating", locked: false },
    ],
  },
  {
    id: "roof",
    title: "Кровля",
    items: [
      { id: "r1", name: "Стропильная система", volume: "1", unit: "комп.", price: 320000, status: "available", locked: false },
      { id: "r2", name: "Металлочерепица", volume: "180", unit: "м²", price: 162000, status: "available", locked: false },
      { id: "r3", name: "Утеплитель 150 мм", volume: "180", unit: "м²", price: 108000, status: "available", locked: false },
    ],
  },
  {
    id: "engineering",
    title: "Инженерные системы",
    items: [
      { id: "e1", name: "Электрика (материалы + работа)", volume: "1", unit: "комп.", price: 280000, status: "available", locked: false },
      { id: "e2", name: "Водоснабжение", volume: "1", unit: "комп.", price: 195000, status: "available", locked: false },
      { id: "e3", name: "Канализация", volume: "1", unit: "комп.", price: 145000, status: "available", locked: false },
      { id: "e4", name: "Отопление (котёл + радиаторы)", volume: "1", unit: "комп.", price: 410000, status: "available", locked: false },
    ],
  },
  {
    id: "finishing",
    title: "Отделка",
    items: [
      { id: "d1", name: "Штукатурка (черновая)", volume: "420", unit: "м²", price: 336000, status: "available", locked: false },
      { id: "d2", name: "Стяжка пола", volume: "120", unit: "м²", price: 144000, status: "available", locked: false },
    ],
  },
  {
    id: "landscape",
    title: "Благоустройство",
    items: [
      { id: "l1", name: "Забор (профлист)", volume: "120", unit: "пог.м", price: 240000, status: "available", locked: false },
      { id: "l2", name: "Дорожки (тротуарная плитка)", volume: "60", unit: "м²", price: 90000, status: "no-price", locked: false },
    ],
  },
];

const versions = [
  { id: 1, name: "Черновая", date: "28.02.2026" },
  { id: 2, name: "Для подрядчика", date: "01.03.2026" },
  { id: 3, name: "Финал", date: "03.03.2026", current: true },
];

const EstimatePage = ({ onNavigate }: { onNavigate: (id: string) => void }) => {
  const [sections, setSections] = useState(initialSections);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ prep: true, foundation: true });
  const [editMode, setEditMode] = useState(false);
  const [showRecalc, setShowRecalc] = useState(false);
  const [showContractor, setShowContractor] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [contractorSent, setContractorSent] = useState(false);
  const [keepManual, setKeepManual] = useState(true);
  const [searchContractor, setSearchContractor] = useState("");

  const toggleSection = (id: string) => setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const sectionTotal = (s: EstimateSection) => s.items.reduce((sum, i) => sum + i.price, 0);
  const materialsTotal = sections.reduce((sum, s) => sum + sectionTotal(s), 0);
  const worksTotal = Math.round(materialsTotal * 0.4);
  const reserve = Math.round((materialsTotal + worksTotal) * 0.1);
  const grandTotal = materialsTotal + worksTotal + reserve;

  const statusIcon = (status: EstimateItem["status"]) => {
    switch (status) {
      case "available": return <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />;
      case "no-price": return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "updating": return <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />;
    }
  };

  const statusLabel = (status: EstimateItem["status"]) => {
    switch (status) {
      case "available": return "В наличии";
      case "no-price": return "Нет цены";
      case "updating": return "Обновляется";
    }
  };

  const noPrice = sections.flatMap(s => s.items).filter(i => i.status === "no-price").length;

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* ──── NAV ──── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={() => onNavigate("chat")} className="flex items-center gap-1 hover:text-primary transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Вернуться в чат
        </button>
        <span>/</span>
        <span>Проекты → Дом в Истре → Смета</span>
      </div>

      {/* ──── HEADER ──── */}
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-foreground tracking-wide">Смета проекта: Дом в Истре</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Автоматический расчёт на основе BIM-модели. Цены актуализируются из маркетплейса в реальном времени.
        </p>
      </div>

      {/* ──── STATUS BAR ──── */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            {noPrice > 0 ? (
              <><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-amber-400">Требуется пересчёт</span></>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-green-400" /><span className="text-green-400">Цены актуальны</span></>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground/60">Обновлено: сегодня, 14:30</span>
          {noPrice > 0 && (
            <span className="text-[10px] text-amber-400/80">{noPrice} позиц. без цены</span>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button size="sm" variant="ghost" className="glass-card text-primary text-xs" onClick={() => setShowRecalc(true)}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Пересчитать
          </Button>
          <Button size="sm" variant="ghost" className={`glass-card text-xs ${editMode ? "text-amber-400 border-amber-400/30" : "text-foreground"}`}
            onClick={() => setEditMode(!editMode)}>
            <PenLine className="w-3.5 h-3.5 mr-1" /> {editMode ? "Выкл. редактирование" : "Редактировать"}
          </Button>
          <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs">
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1" /> Экспорт Excel
          </Button>
          <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs"
            onClick={() => { setShowContractor(true); setContractorSent(false); }}>
            <Share2 className="w-3.5 h-3.5 mr-1" /> Отправить подрядчику
          </Button>
          <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs" onClick={() => setShowVersions(true)}>
            <Save className="w-3.5 h-3.5 mr-1" /> Версии
          </Button>
        </div>
      </div>

      {/* ──── SECTIONS ACCORDION ──── */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isOpen = openSections[section.id];
          return (
            <div key={section.id} className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="text-sm font-bold text-foreground">{section.title}</span>
                  <span className="text-[10px] text-muted-foreground/60">({section.items.length} поз.)</span>
                </div>
                <span className="text-sm font-bold text-primary">₽{sectionTotal(section).toLocaleString("ru")}</span>
              </button>

              {isOpen && (
                <div className="border-t border-white/5">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                    <div className="col-span-4">Наименование</div>
                    <div className="col-span-1 text-right">Объём</div>
                    <div className="col-span-1">Ед.</div>
                    <div className="col-span-2 text-right">Цена</div>
                    <div className="col-span-2 text-right">Сумма</div>
                    <div className="col-span-2 text-center">Статус</div>
                  </div>

                  {section.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-t border-white/5 hover:bg-white/5 transition-colors group text-xs">
                      <div className="col-span-4 flex items-center gap-2">
                        {item.locked && <Lock className="w-3 h-3 text-amber-400" />}
                        <span className="text-foreground">{item.name}</span>
                      </div>
                      <div className="col-span-1 text-right text-foreground">
                        {editMode ? (
                          <Input defaultValue={item.volume} className="h-6 text-xs bg-white/5 border-white/10 text-foreground px-1 text-right w-full" />
                        ) : item.volume}
                      </div>
                      <div className="col-span-1 text-muted-foreground">{item.unit}</div>
                      <div className="col-span-2 text-right text-foreground">
                        {editMode ? (
                          <Input defaultValue={item.price.toString()} className="h-6 text-xs bg-white/5 border-white/10 text-foreground px-1 text-right w-full" />
                        ) : `₽${item.price.toLocaleString("ru")}`}
                      </div>
                      <div className="col-span-2 text-right font-semibold text-foreground">₽{item.price.toLocaleString("ru")}</div>
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        {statusIcon(item.status)}
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">{statusLabel(item.status)}</span>
                      </div>

                      {/* Hover actions */}
                      {editMode && (
                        <div className="col-span-12 flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] glass-card text-primary">
                            <ShoppingCart className="w-3 h-3 mr-1" /> Купить
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] glass-card text-foreground">
                            <MessageSquare className="w-3 h-3 mr-1" /> Комментарий
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] glass-card text-amber-400">
                            {item.locked ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                            {item.locked ? "Разблокировать" : "Заблокировать"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] glass-card text-destructive">
                            <Trash2 className="w-3 h-3 mr-1" /> Удалить
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                  {editMode && (
                    <div className="px-4 py-2 border-t border-white/5">
                      <Button size="sm" variant="ghost" className="h-7 text-[10px] glass-card text-primary">
                        <Plus className="w-3 h-3 mr-1" /> Добавить позицию
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ──── TOTALS ──── */}
      <div className="glass-card glass-glow rounded-2xl p-5 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Материалы</span>
          <span className="text-foreground font-semibold">₽{materialsTotal.toLocaleString("ru")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Работы (≈40%)</span>
          <span className="text-foreground font-semibold">₽{worksTotal.toLocaleString("ru")}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Резерв (10%)</span>
          <span className="text-foreground font-semibold">₽{reserve.toLocaleString("ru")}</span>
        </div>
        <div className="flex justify-between text-lg font-black border-t border-white/10 pt-3">
          <span className="text-foreground">ВСЕГО</span>
          <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
            ₽{grandTotal.toLocaleString("ru")}
          </span>
        </div>
      </div>

      {/* ──── BOTTOM ACTIONS ──── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button className="w-full glass-card hover:glass-glow text-foreground border border-white/15 h-12 text-sm"
          variant="ghost" onClick={() => onNavigate("market")}>
          <ShoppingCart className="w-4 h-4 mr-2 text-primary" />
          Добавить все материалы в корзину
        </Button>
        <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-12 text-sm"
          onClick={() => onNavigate("chat")}>
          <Bot className="w-4 h-4 mr-2" />
          Передать данные AI-агенту
        </Button>
      </div>

      {/* ──── RECALC MODAL ──── */}
      <Dialog open={showRecalc} onOpenChange={setShowRecalc}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Обновить данные из модели?</DialogTitle>
            <DialogDescription>
              Текущие ручные правки могут быть перезаписаны данными из BIM-модели.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <Checkbox checked={keepManual} onCheckedChange={(v) => setKeepManual(!!v)} />
              Сохранить ручные изменения
            </label>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setShowRecalc(false)}>
                Отмена
              </Button>
              <Button className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={() => setShowRecalc(false)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Пересчитать
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ──── SEND TO CONTRACTOR MODAL ──── */}
      <Dialog open={showContractor} onOpenChange={setShowContractor}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Выберите исполнителей</DialogTitle>
            <DialogDescription>Отправьте смету на оценку подрядчикам из каталога</DialogDescription>
          </DialogHeader>
          {contractorSent ? (
            <div className="text-center py-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto" />
              <p className="text-primary font-bold">Запрос отправлен</p>
              <p className="text-xs text-muted-foreground">Ожидаем ответ в течение 3 рабочих дней</p>
              <Button variant="ghost" className="glass-card text-foreground mt-2" onClick={() => setShowContractor(false)}>
                Закрыть
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 glass-card rounded-xl p-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input value={searchContractor} onChange={(e) => setSearchContractor(e.target.value)}
                  placeholder="Найти подрядчика" className="bg-transparent border-0 text-foreground text-sm focus-visible:ring-0" />
              </div>
              {[
                { name: "СтройГрад", spec: "Фундаментные работы", rating: 4.8 },
                { name: "ЭкоСтрой", spec: "Отделка", rating: 4.5 },
                { name: "Инженерные решения", spec: "Инженерия", rating: 4.9 },
              ].map((c, i) => (
                <label key={i} className="flex items-center gap-3 glass-card rounded-xl p-3 cursor-pointer hover:bg-white/5 transition-colors">
                  <Checkbox />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.spec} · ★ {c.rating}</p>
                  </div>
                </label>
              ))}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Комментарий к заявке</Label>
                <Input className="bg-white/5 border-white/10 text-foreground" />
              </div>
              <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={() => setContractorSent(true)}>
                Отправить запрос
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ──── VERSIONS MODAL ──── */}
      <Dialog open={showVersions} onOpenChange={setShowVersions}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Версии сметы</DialogTitle>
            <DialogDescription>Управляйте версиями и сравнивайте изменения</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {versions.map((v) => (
              <div key={v.id} className={`glass-card rounded-xl p-3 flex items-center justify-between ${v.current ? "border-primary/30" : ""}`}>
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    Версия {v.id}: {v.name}
                    {v.current && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Текущая</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{v.date}</p>
                </div>
                <div className="flex gap-1">
                  {!v.current && (
                    <Button size="sm" variant="ghost" className="h-7 px-2 text-[10px] glass-card text-foreground">
                      <RotateCcw className="w-3 h-3 mr-1" /> Восстановить
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full glass-card text-primary text-xs mt-2">
            <GitCompare className="w-3.5 h-3.5 mr-1" /> Сравнить версии
          </Button>
          <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs">
            <Save className="w-3.5 h-3.5 mr-1" /> Сохранить текущую как новую версию
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EstimatePage;
