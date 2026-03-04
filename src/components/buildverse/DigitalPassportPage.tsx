import { useState } from "react";
import {
  Upload, Share2, Download, Lock, CheckCircle2, ChevronDown, ChevronRight,
  Eye, FileText, MessageSquare, Search, Filter, Clock, User, Building2,
  Wrench, Shield, AlertTriangle, Calendar, Phone, Mail, MapPin, Hash,
  Layers, Box, RotateCcw, Trash2, Tag, Plus, ExternalLink, Copy,
  FileCheck, Settings2, ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

/* ───── TYPES ───── */
interface PassportDocument {
  id: string;
  name: string;
  section: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  author: string;
  size: string;
}

interface Equipment {
  id: string;
  name: string;
  model: string;
  serial: string;
  installed: string;
  warranty: string;
  warrantyStatus: "active" | "expiring" | "expired";
}

interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  role: string;
  action: string;
  type: "added" | "changed" | "deleted";
}

/* ───── MOCK DATA ───── */
const mockDocs: PassportDocument[] = [
  { id: "1", name: "АР_Раздел_1_Планировки.pdf", section: "ar", status: "approved", date: "2026-01-15", author: "Иванов А.", size: "4.2 MB" },
  { id: "2", name: "АР_Раздел_2_Фасады.pdf", section: "ar", status: "approved", date: "2026-01-20", author: "Иванов А.", size: "8.1 MB" },
  { id: "3", name: "КР_Фундамент.pdf", section: "kr", status: "pending", date: "2026-02-01", author: "Петров С.", size: "12.3 MB" },
  { id: "4", name: "КР_Каркас.pdf", section: "kr", status: "approved", date: "2026-02-05", author: "Петров С.", size: "9.7 MB" },
  { id: "5", name: "ИОС_Электрика.pdf", section: "ios", status: "rejected", date: "2026-02-10", author: "Сидоров М.", size: "5.5 MB" },
  { id: "6", name: "ПОС_Организация.pdf", section: "pos", status: "approved", date: "2026-01-25", author: "Козлов Д.", size: "3.8 MB" },
  { id: "7", name: "Смета_v3.xlsx", section: "budget", status: "approved", date: "2026-02-12", author: "Система", size: "1.2 MB" },
];

const mockExecDocs: PassportDocument[] = [
  { id: "e1", name: "Акт скрытых работ №1 — Фундамент", section: "asr", status: "approved", date: "2026-02-20", author: "Петров С.", size: "2.1 MB" },
  { id: "e2", name: "Сертификат бетон М300", section: "certs", status: "approved", date: "2026-02-18", author: "Поставщик", size: "0.8 MB" },
  { id: "e3", name: "Паспорт котла Viessmann", section: "equip_docs", status: "approved", date: "2026-03-01", author: "Подрядчик", size: "1.5 MB" },
  { id: "e4", name: "Журнал бетонных работ", section: "journals", status: "pending", date: "2026-02-25", author: "Прораб", size: "3.2 MB" },
];

const mockEquipment: Equipment[] = [
  { id: "eq1", name: "Газовый котёл", model: "Viessmann Vitodens 200-W", serial: "VW-2026-001234", installed: "2026-02-15", warranty: "2031-02-15", warrantyStatus: "active" },
  { id: "eq2", name: "Циркуляционный насос", model: "Grundfos Alpha2", serial: "GF-2026-005678", installed: "2026-02-20", warranty: "2029-02-20", warrantyStatus: "active" },
  { id: "eq3", name: "Приточная вентиляция", model: "Breezart 550 Lux", serial: "BZ-2026-009012", installed: "2026-03-01", warranty: "2028-03-01", warrantyStatus: "expiring" },
  { id: "eq4", name: "Электрический щит", model: "ABB Mistral 41W", serial: "ABB-2026-003456", installed: "2026-02-10", warranty: "2027-02-10", warrantyStatus: "expired" },
];

const mockHistory: HistoryEntry[] = [
  { id: "h1", date: "2026-03-04 10:15", user: "Иванов А.", role: "Архитектор", action: "Загрузил документ «АР_Раздел 3.pdf»", type: "added" },
  { id: "h2", date: "2026-03-03 16:40", user: "Петров С.", role: "Конструктор", action: "Обновил «КР_Фундамент.pdf» до версии 2", type: "changed" },
  { id: "h3", date: "2026-03-02 09:20", user: "Козлов Д.", role: "Прораб", action: "Загрузил акт скрытых работ №2", type: "added" },
  { id: "h4", date: "2026-03-01 14:00", user: "Система", role: "Автоматически", action: "Гарантия на вентиляцию истекает через 30 дней", type: "changed" },
  { id: "h5", date: "2026-02-28 11:30", user: "Сидоров М.", role: "Инженер", action: "Удалил устаревшую версию ИОС_Электрика_v1.pdf", type: "deleted" },
];

/* ───── STATUS HELPERS ───── */
const statusColor = (s: string) => {
  switch (s) {
    case "approved": return "bg-green-500/20 text-green-400";
    case "pending": return "bg-amber-500/20 text-amber-400";
    case "rejected": return "bg-red-500/20 text-red-400";
    default: return "bg-white/10 text-muted-foreground";
  }
};
const statusLabel = (s: string) => {
  switch (s) {
    case "approved": return "Согласовано";
    case "pending": return "На согласовании";
    case "rejected": return "Требует исправлений";
    default: return s;
  }
};
const warrantyColor = (s: string) => {
  switch (s) {
    case "active": return "bg-green-500/20 text-green-400";
    case "expiring": return "bg-amber-500/20 text-amber-400";
    case "expired": return "bg-red-500/20 text-red-400";
    default: return "";
  }
};
const warrantyLabel = (s: string) => {
  switch (s) {
    case "active": return "Действует";
    case "expiring": return "Истекает";
    case "expired": return "Истёк";
    default: return s;
  }
};
const historyTypeColor = (t: string) => {
  switch (t) {
    case "added": return "text-green-400";
    case "changed": return "text-amber-400";
    case "deleted": return "text-red-400";
    default: return "text-muted-foreground";
  }
};

/* ───── TABS ───── */
const tabs = [
  { id: "general", label: "Общая информация", icon: FileText },
  { id: "bim", label: "BIM-модель", icon: Box },
  { id: "project_docs", label: "Проектная документация", icon: Layers },
  { id: "exec_docs", label: "Исполнительная документация", icon: FileCheck },
  { id: "maintenance", label: "Эксплуатация", icon: Wrench },
  { id: "history", label: "История изменений", icon: Clock },
];

/* ───── ACCORDION SECTION ───── */
const AccordionSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">{children}</div>}
    </div>
  );
};

/* ───── DOC ROW ───── */
const DocRow = ({ doc }: { doc: PassportDocument }) => (
  <div className="flex items-center justify-between py-2 group">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{doc.name}</p>
        <p className="text-[10px] text-muted-foreground">{doc.date} · {doc.author} · {doc.size}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor(doc.status)}`}>{statusLabel(doc.status)}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Просмотр"><Eye className="w-3.5 h-3.5" /></button>
        <button className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Скачать"><Download className="w-3.5 h-3.5" /></button>
        <button className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground" title="Комментарий"><MessageSquare className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
interface DigitalPassportPageProps {
  onNavigate: (id: string) => void;
}

const DigitalPassportPage = ({ onNavigate }: DigitalPassportPageProps) => {
  const [activeTab, setActiveTab] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showUpload, setShowUpload] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReadiness, setShowReadiness] = useState(false);
  const [showAccessSettings, setShowAccessSettings] = useState(false);

  // Upload modal state
  const [uploadSection, setUploadSection] = useState("ar");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadTags, setUploadTags] = useState("");

  // Share modal
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("view");
  const [shareDuration, setShareDuration] = useState("30");
  const [linkCopied, setLinkCopied] = useState(false);

  // History filter
  const [historyFilter, setHistoryFilter] = useState("all");

  const completeness = 85;
  const totalRequired = 53;
  const totalLoaded = 45;

  const projectName = "Дом в Истре";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={() => onNavigate("projects")} className="hover:text-primary transition-colors">Проекты</button>
        <span>→</span>
        <span className="text-foreground/70">{projectName}</span>
        <span>→</span>
        <span className="text-primary">Цифровой паспорт</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-foreground tracking-wide">Цифровой паспорт: {projectName}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Вся документация, модели и история изменений в одном месте. Доступно 24/7 с любого устройства.
        </p>
      </div>

      {/* Status bar */}
      <div className="glass-card rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${completeness >= 80 ? "bg-green-400" : completeness >= 50 ? "bg-amber-400" : "bg-red-400"}`} />
            <span className="text-xs text-foreground font-medium">Комплектность {completeness}%</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Загружено {totalLoaded} из {totalRequired} документов</span>
        </div>
        <span className="text-[10px] text-muted-foreground">Обновлено: сегодня, 10:15</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Загрузить документ", icon: Upload, onClick: () => setShowUpload(true) },
          { label: "Поделиться", icon: Share2, onClick: () => setShowShare(true) },
          { label: "Экспорт архива", icon: Download, onClick: () => {} },
          { label: "Настройки доступа", icon: Lock, onClick: () => setShowAccessSettings(true) },
          { label: "Подготовить к сдаче", icon: CheckCircle2, onClick: () => setShowReadiness(true) },
        ].map((btn) => (
          <Button
            key={btn.label}
            variant="ghost"
            size="sm"
            onClick={btn.onClick}
            className="glass-card text-foreground text-xs hover:bg-white/10 border border-white/10"
          >
            <btn.icon className="w-3.5 h-3.5 mr-1.5 text-primary" />
            {btn.label}
          </Button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === t.id
                ? "bg-primary/20 text-primary border border-primary/30"
                : "glass-card text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTab === "general" && <GeneralTab />}
        {activeTab === "bim" && <BIMTab />}
        {activeTab === "project_docs" && <ProjectDocsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === "exec_docs" && <ExecDocsTab />}
        {activeTab === "maintenance" && <MaintenanceTab />}
        {activeTab === "history" && <HistoryTab filter={historyFilter} setFilter={setHistoryFilter} />}
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Upload Document */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="glass-card border-white/15 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Добавление документа</DialogTitle>
            <DialogDescription className="text-muted-foreground">Загрузите файл в соответствующий раздел паспорта</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Раздел</Label>
              <select
                value={uploadSection}
                onChange={(e) => setUploadSection(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground"
              >
                <option value="ar">Архитектурные решения (АР)</option>
                <option value="kr">Конструктивные решения (КР)</option>
                <option value="ios">Инженерные системы (ИОС)</option>
                <option value="pos">Проект организации строительства (ПОС)</option>
                <option value="budget">Смета и бюджет</option>
                <option value="asr">Акты скрытых работ</option>
                <option value="certs">Сертификаты на материалы</option>
                <option value="equip_docs">Паспорта на оборудование</option>
                <option value="journals">Журналы производства работ</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Файл</Label>
              <div className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Перетащите файл или нажмите для выбора</p>
                <p className="text-[10px] text-muted-foreground/50 mt-1">PDF, DOCX, XLSX, IFC, DWG · до 50 МБ</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Описание</Label>
              <Input value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} placeholder="Краткое описание документа" className="bg-white/5 border-white/10 text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Теги</Label>
              <Input value={uploadTags} onChange={(e) => setUploadTags(e.target.value)} placeholder="Гарантия, Срочно, На согласовании" className="bg-white/5 border-white/10 text-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Доступ</Label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                <option>Только команда</option>
                <option>По ссылке</option>
                <option>Публично</option>
              </select>
            </div>
            <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30" onClick={() => setShowUpload(false)}>
              <Upload className="w-4 h-4 mr-2" /> Загрузить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="glass-card border-white/15 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Доступ к паспорту</DialogTitle>
            <DialogDescription className="text-muted-foreground">Пригласите участников или сгенерируйте ссылку</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email участника</Label>
              <Input value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} placeholder="email@example.com" className="bg-white/5 border-white/10 text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Роль</Label>
                <select value={shareRole} onChange={(e) => setShareRole(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="view">Просмотр</option>
                  <option value="edit">Редактирование</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Срок доступа</Label>
                <select value={shareDuration} onChange={(e) => setShareDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="forever">Бессрочно</option>
                  <option value="7">7 дней</option>
                  <option value="30">30 дней</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
              <Mail className="w-4 h-4 mr-2" /> Отправить приглашение
            </Button>
            <div className="border-t border-white/10 pt-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Или скопируйте ссылку</Label>
              <div className="flex gap-2">
                <Input value="https://buildverse.ai/passport/abc123" readOnly className="bg-white/5 border-white/10 text-foreground text-xs flex-1" />
                <Button variant="ghost" size="sm" className="glass-card text-foreground shrink-0" onClick={() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 2000); }}>
                  <Copy className="w-3.5 h-3.5 mr-1" /> {linkCopied ? "Скопировано" : "Копировать"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Readiness check */}
      <Dialog open={showReadiness} onOpenChange={setShowReadiness}>
        <DialogContent className="glass-card border-white/15 text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle>Проверка комплектности</DialogTitle>
            <DialogDescription className="text-muted-foreground">Готовность пакета документов для госорганов</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Progress value={completeness} className="flex-1 h-3" />
              <span className="text-sm font-bold text-foreground">{completeness}%</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Отсутствующие документы</h4>
              {["Акты скрытых работ №3-5", "Исполнительные схемы фундамента", "Журнал авторского надзора", "Заключение экспертизы ПД", "Разрешение на строительство", "Акт приёмки ИС", "Справка от Ростехнадзора", "Заключение пожнадзора"].map((doc) => (
                <div key={doc} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-xs text-foreground">{doc}</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-primary hover:bg-primary/10" onClick={() => { setShowReadiness(false); setShowUpload(true); }}>
                    Загрузить
                  </Button>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> На согласовании</h4>
              {["КР_Фундамент.pdf — ожидает подтверждения от архитектора", "Журнал бетонных работ — на проверке"].map((doc) => (
                <div key={doc} className="flex items-center py-1.5 px-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <span className="text-xs text-foreground">{doc}</span>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-3 text-center">
              <p className="text-sm font-semibold text-foreground">Готово к сдаче: <span className="text-red-400">Нет</span></p>
              <p className="text-[10px] text-muted-foreground mt-1">Загрузите недостающие документы и дождитесь согласования</p>
            </div>

            <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 opacity-50 cursor-not-allowed" disabled>
              <FileCheck className="w-4 h-4 mr-2" /> Сформировать пакет для госорганов
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access settings */}
      <Dialog open={showAccessSettings} onOpenChange={setShowAccessSettings}>
        <DialogContent className="glass-card border-white/15 text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle>Настройки доступа</DialogTitle>
            <DialogDescription className="text-muted-foreground">Управление правами пользователей паспорта</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { name: "Иванов А.", role: "Архитектор", access: "Редактирование проектной документации" },
              { name: "Петров С.", role: "Подрядчик", access: "Загрузка исполнительной документации" },
              { name: "УК «Комфорт»", role: "Эксплуатация", access: "Просмотр + раздел ТО" },
            ].map((u) => (
              <div key={u.name} className="flex items-center justify-between py-2 px-3 rounded-lg glass-card">
                <div>
                  <p className="text-xs font-medium text-foreground">{u.name}</p>
                  <p className="text-[10px] text-muted-foreground">{u.role} · {u.access}</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button className="w-full glass-card text-foreground hover:bg-white/10 border border-white/10 text-xs" onClick={() => { setShowAccessSettings(false); setShowShare(true); }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Добавить участника
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: GENERAL INFO
   ═══════════════════════════════════════════ */
const GeneralTab = () => {
  const objectStatus = "construction";
  const statusOptions = [
    { value: "project", label: "Проект" },
    { value: "construction", label: "Строительство" },
    { value: "commissioning", label: "Ввод в эксплуатацию" },
    { value: "operation", label: "Эксплуатация" },
  ];

  return (
    <div className="space-y-4">
      <AccordionSection title="Данные объекта" defaultOpen>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Адрес объекта", value: "Московская обл., г. Истра, ул. Озёрная, 15", icon: MapPin },
            { label: "Кадастровый номер", value: "50:11:0050101:123", icon: Hash },
            { label: "Площадь", value: "245 м²", icon: Layers },
            { label: "Этажность", value: "2", icon: Building2 },
            { label: "Год постройки", value: "2026", icon: Calendar },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><f.icon className="w-3 h-3" />{f.label}</Label>
              <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-foreground">{f.value}</div>
            </div>
          ))}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><Settings2 className="w-3 h-3" />Статус</Label>
            <div className="flex gap-1.5 flex-wrap">
              {statusOptions.map((s) => (
                <span key={s.value} className={`text-[10px] px-2.5 py-1 rounded-full ${s.value === objectStatus ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      <AccordionSection title="Участники проекта">
        {[
          { role: "Заказчик", name: "Смирнов Алексей Игоревич", inn: "7701234567", phone: "+7 (495) 123-45-67" },
          { role: "Проектировщик", name: "ООО «АрхПроект»", inn: "7702345678", phone: "+7 (495) 234-56-78" },
          { role: "Генподрядчик", name: "ООО «СтройМастер»", inn: "7703456789", phone: "+7 (495) 345-67-89" },
          { role: "Эксплуатирующая организация", name: "УК «Комфорт»", inn: "—", phone: "+7 (495) 456-78-90" },
        ].map((p) => (
          <div key={p.role} className="flex items-start gap-3 py-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground">{p.role}</p>
              <p className="text-[10px] text-muted-foreground">{p.name} · ИНН: {p.inn}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{p.phone}</p>
            </div>
          </div>
        ))}
      </AccordionSection>

      <AccordionSection title="Ключевые даты">
        {[
          { label: "Начало проектирования", date: "15.01.2026" },
          { label: "Начало строительства", date: "01.03.2026" },
          { label: "Окончание строительства", date: "—" },
          { label: "Ввод в эксплуатацию", date: "—" },
        ].map((d) => (
          <div key={d.label} className="flex items-center justify-between py-1.5">
            <span className="text-xs text-muted-foreground">{d.label}</span>
            <span className="text-xs text-foreground font-medium">{d.date}</span>
          </div>
        ))}
      </AccordionSection>
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: BIM MODEL
   ═══════════════════════════════════════════ */
const BIMTab = () => (
  <div className="space-y-4">
    {/* 3D Viewer placeholder */}
    <div className="glass-card rounded-2xl overflow-hidden relative" style={{ height: "350px" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Box className="w-16 h-16 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">3D-просмотрщик BIM-модели</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">Вращение, масштабирование, сечение модели</p>
        <p className="text-[10px] text-muted-foreground/50">Будет доступен после подключения AI-агента</p>
      </div>
    </div>

    <AccordionSection title="Версии модели" defaultOpen>
      {[
        { ver: "Версия 3 (Рабочая)", date: "01.03.2026", author: "Иванов А.", comment: "Актуальная рабочая версия" },
        { ver: "Версия 2 (Эскиз утверждённый)", date: "15.02.2026", author: "Иванов А.", comment: "Утверждён заказчиком" },
        { ver: "Версия 1 (Эскиз)", date: "20.01.2026", author: "Иванов А.", comment: "Первоначальный эскиз" },
      ].map((v, i) => (
        <div key={i} className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs font-medium text-foreground">{v.ver}</p>
            <p className="text-[10px] text-muted-foreground">{v.date} · {v.author} · {v.comment}</p>
          </div>
          <div className="flex gap-1">
            {["IFC", "RVT", "DWG"].map((fmt) => (
              <Button key={fmt} variant="ghost" size="sm" className="h-6 px-2 text-[10px] glass-card text-muted-foreground hover:text-primary">
                <Download className="w-3 h-3 mr-1" />{fmt}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </AccordionSection>

    <AccordionSection title="Поиск по элементам модели">
      <div className="flex gap-2 mb-3">
        <Input placeholder="Например: окно спальня 2 этаж" className="bg-white/5 border-white/10 text-foreground text-xs flex-1" />
        <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs shrink-0">
          <Search className="w-3.5 h-3.5 mr-1" /> Найти
        </Button>
      </div>
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">Поиск по свойствам элементов будет доступен после загрузки BIM-модели</p>
      </div>
    </AccordionSection>
  </div>
);

/* ═══════════════════════════════════════════
   TAB: PROJECT DOCS
   ═══════════════════════════════════════════ */
const ProjectDocsTab = ({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (v: string) => void }) => {
  const sections = [
    { id: "ar", title: "Архитектурные решения (АР)" },
    { id: "kr", title: "Конструктивные решения (КР)" },
    { id: "ios", title: "Инженерные системы (ИОС)" },
    { id: "pos", title: "Проект организации строительства (ПОС)" },
    { id: "budget", title: "Смета и бюджет" },
  ];

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground shrink-0 ml-2" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск по документам..."
          className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0 text-xs"
        />
      </div>

      {sections.map((sec) => {
        const docs = mockDocs.filter((d) => d.section === sec.id);
        if (docs.length === 0) return null;
        return (
          <AccordionSection key={sec.id} title={sec.title} defaultOpen={sec.id === "ar"}>
            <div className="divide-y divide-white/5">
              {docs.map((doc) => <DocRow key={doc.id} doc={doc} />)}
            </div>
          </AccordionSection>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: EXEC DOCS
   ═══════════════════════════════════════════ */
const ExecDocsTab = () => {
  const sections = [
    { id: "asr", title: "Акты скрытых работ (АСР)" },
    { id: "certs", title: "Сертификаты на материалы" },
    { id: "equip_docs", title: "Паспорта на оборудование" },
    { id: "journals", title: "Журналы производства работ" },
    { id: "schemes", title: "Исполнительные схемы" },
  ];

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-primary shrink-0" />
        <span>Документы привязаны к элементам BIM-модели. Система отслеживает сроки действия сертификатов.</span>
      </div>

      {sections.map((sec) => {
        const docs = mockExecDocs.filter((d) => d.section === sec.id);
        return (
          <AccordionSection key={sec.id} title={sec.title}>
            {docs.length > 0 ? (
              <div className="divide-y divide-white/5">
                {docs.map((doc) => <DocRow key={doc.id} doc={doc} />)}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-3">Документы не загружены</p>
            )}
          </AccordionSection>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   TAB: MAINTENANCE
   ═══════════════════════════════════════════ */
const MaintenanceTab = () => (
  <div className="space-y-4">
    <AccordionSection title="Оборудование" defaultOpen>
      {mockEquipment.map((eq) => (
        <div key={eq.id} className="glass-card rounded-xl p-3 space-y-2 mb-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">{eq.name}</p>
              <p className="text-[10px] text-muted-foreground">{eq.model} · S/N: {eq.serial}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${warrantyColor(eq.warrantyStatus)}`}>{warrantyLabel(eq.warrantyStatus)}</span>
          </div>
          <div className="flex gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Установлен: {eq.installed}</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Гарантия до: {eq.warranty}</span>
          </div>
        </div>
      ))}
    </AccordionSection>

    <AccordionSection title="Регламенты ТО">
      {[
        { task: "ТО газового котла", freq: "Ежегодно", next: "15.02.2027", status: "scheduled" },
        { task: "Чистка вентиляции", freq: "Ежеквартально", next: "01.06.2026", status: "scheduled" },
        { task: "Проверка электрики", freq: "Ежегодно", next: "10.02.2027", status: "scheduled" },
        { task: "Обслуживание насоса", freq: "Раз в 2 года", next: "20.02.2028", status: "scheduled" },
      ].map((m) => (
        <div key={m.task} className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs text-foreground">{m.task}</p>
            <p className="text-[10px] text-muted-foreground">{m.freq} · Следующее: {m.next}</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Запланировано</span>
        </div>
      ))}
    </AccordionSection>

    <AccordionSection title="Контакты служб">
      {[
        { name: "Аварийная служба", phone: "+7 (495) 112-00-00", icon: AlertTriangle },
        { name: "УК «Комфорт»", phone: "+7 (495) 456-78-90", icon: Building2 },
        { name: "Гарантийная служба Viessmann", phone: "+7 (800) 100-88-00", icon: Wrench },
      ].map((c) => (
        <div key={c.name} className="flex items-center gap-3 py-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <c.icon className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">{c.name}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</p>
          </div>
        </div>
      ))}
    </AccordionSection>

    <AccordionSection title="Гарантийные обязательства">
      {mockEquipment.map((eq) => (
        <div key={eq.id} className="flex items-center justify-between py-2">
          <div>
            <p className="text-xs text-foreground">{eq.name}</p>
            <p className="text-[10px] text-muted-foreground">Гарантия до {eq.warranty}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${warrantyColor(eq.warrantyStatus)}`}>{warrantyLabel(eq.warrantyStatus)}</span>
        </div>
      ))}
    </AccordionSection>
  </div>
);

/* ═══════════════════════════════════════════
   TAB: HISTORY
   ═══════════════════════════════════════════ */
const HistoryTab = ({ filter, setFilter }: { filter: string; setFilter: (v: string) => void }) => {
  const filterOptions = [
    { value: "all", label: "Все" },
    { value: "added", label: "Добавлено" },
    { value: "changed", label: "Изменено" },
    { value: "deleted", label: "Удалено" },
  ];
  const filtered = filter === "all" ? mockHistory : mockHistory.filter((h) => h.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.value ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="glass-card text-foreground text-xs">
          <Download className="w-3.5 h-3.5 mr-1" /> Экспорт лога
        </Button>
      </div>

      <div className="space-y-1">
        {filtered.map((h) => (
          <div key={h.id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${h.type === "added" ? "bg-green-400" : h.type === "changed" ? "bg-amber-400" : "bg-red-400"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground">{h.action}</p>
              <p className="text-[10px] text-muted-foreground">{h.user} ({h.role}) · {h.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DigitalPassportPage;
