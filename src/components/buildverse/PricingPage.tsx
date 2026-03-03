import { useState } from "react";
import {
  Check, X as XIcon, Star, CreditCard, Smartphone, FileText, Building2,
  ChevronDown, AlertTriangle, Download, Zap, Users, Shield, Server,
  Sparkles, Crown, Rocket, Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

/* ───── PLAN DATA ───── */
const plans = [
  {
    id: "free",
    name: "FREE",
    badge: "Бесплатно",
    badgeColor: "bg-green-500/20 text-green-400",
    accentClass: "border-green-500/30",
    monthlyPrice: 0,
    yearlyPrice: 0,
    period: "навсегда",
    audience: "Частные лица, знакомство с платформой",
    icon: Gift,
    features: [
      { text: "10 AI-запросов / мес", included: true },
      { text: "1 активный проект", included: true },
      { text: "Базовые шаблоны", included: true },
      { text: "1 GB хранилища", included: true },
      { text: "Email-поддержка (48 ч)", included: true },
      { text: "Верификация бизнеса", included: false },
      { text: "API доступ", included: false },
      { text: "Командная работа", included: false },
    ],
  },
  {
    id: "pro",
    name: "PRO",
    badge: "Популярный выбор ⭐",
    badgeColor: "bg-blue-500/20 text-blue-400",
    accentClass: "border-blue-500/40 ring-1 ring-blue-500/20",
    monthlyPrice: 1990,
    yearlyPrice: 19900,
    period: "мес",
    audience: "Самозанятые, частные специалисты",
    popular: true,
    icon: Rocket,
    features: [
      { text: "100 AI-запросов / мес", included: true },
      { text: "10 активных проектов", included: true },
      { text: "Расширенная библиотека шаблонов", included: true },
      { text: "10 GB хранилища", included: true },
      { text: "Приоритетная поддержка (12 ч)", included: true },
      { text: "Экспорт в PDF / DWG", included: true },
      { text: "API-доступ (1 000 вызовов / день)", included: true },
      { text: "Командная работа", included: false },
      { text: "Верификация бизнеса", included: false },
    ],
  },
  {
    id: "business",
    name: "BUSINESS",
    badge: "Для бизнеса",
    badgeColor: "bg-purple-500/20 text-purple-400",
    accentClass: "border-purple-500/30",
    monthlyPrice: 7990,
    yearlyPrice: 79900,
    period: "мес",
    audience: "ИП, ООО, небольшие бюро",
    icon: Building2,
    features: [
      { text: "Безлимитные AI-запросы", included: true },
      { text: "50 активных проектов", included: true },
      { text: "Премиум-шаблоны + кастомизация", included: true },
      { text: "100 GB хранилища", included: true },
      { text: "Выделенный менеджер (24/7)", included: true },
      { text: "Командная работа (до 5 пользователей)", included: true },
      { text: "Верификация бизнеса ✓", included: true },
      { text: "API-доступ (10 000 вызовов / день)", included: true },
      { text: "On-premise развёртывание", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "ENTERPRISE",
    badge: "Индивидуально",
    badgeColor: "bg-amber-500/20 text-amber-400",
    accentClass: "border-amber-500/30",
    monthlyPrice: -1,
    yearlyPrice: -1,
    period: "По договору",
    audience: "Застройщики, заводы, холдинги",
    icon: Crown,
    features: [
      { text: "Всё из Business", included: true },
      { text: "Безлимитные проекты и хранилище", included: true },
      { text: "SLA 99,9%", included: true },
      { text: "On-premise развёртывание (опция)", included: true },
      { text: "Кастомная интеграция", included: true },
      { text: "Обучение сотрудников", included: true },
      { text: "Персональный AI-агент (fine-tuning)", included: true },
      { text: "Персональный менеджер", included: true },
    ],
  },
];

const comparisonRows = [
  { label: "AI-запросы", values: ["10/мес", "100/мес", "Безлимит", "Безлимит"] },
  { label: "Активные проекты", values: ["1", "10", "50", "Безлимит"] },
  { label: "Хранилище", values: ["1 GB", "10 GB", "100 GB", "Безлимит"] },
  { label: "Поддержка", values: ["48 ч", "12 ч", "24/7", "24/7 персонально"] },
  { label: "API-доступ", values: ["✗", "1 000/день", "10 000/день", "Безлимит"] },
  { label: "Командная работа", values: ["✗", "✗", "до 5", "Безлимит"] },
  { label: "Верификация бизнеса", values: ["✗", "✗", "✓", "✓"] },
  { label: "Экспорт PDF/DWG", values: ["✗", "✓", "✓", "✓"] },
  { label: "White-label", values: ["✗", "✗", "✗", "✓"] },
  { label: "SLA", values: ["✗", "✗", "✗", "99,9%"] },
];

const PricingPage = () => {
  const { user } = useAuth();
  const [yearly, setYearly] = useState(false);
  const [currentPlan] = useState("free");
  const [showPayment, setShowPayment] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentPeriod, setPaymentPeriod] = useState<"monthly" | "yearly">("monthly");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const getPrice = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === -1) return "Индивидуально";
    if (plan.monthlyPrice === 0) return "₽0";
    return yearly
      ? `₽${plan.yearlyPrice.toLocaleString("ru")}`
      : `₽${plan.monthlyPrice.toLocaleString("ru")}`;
  };

  const getPeriod = (plan: typeof plans[0]) => {
    if (plan.monthlyPrice === 0) return "/ навсегда";
    if (plan.monthlyPrice === -1) return plan.period;
    return yearly ? "/ год" : "/ мес";
  };

  const selectedPlanData = plans.find(p => p.id === showPayment);

  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  const handlePay = () => {
    setPaymentSuccess(true);
  };

  const paymentTotal = () => {
    if (!selectedPlanData || selectedPlanData.monthlyPrice <= 0) return 0;
    const base = paymentPeriod === "yearly" ? selectedPlanData.yearlyPrice : selectedPlanData.monthlyPrice;
    return promoApplied ? Math.round(base * 0.9) : base;
  };

  /* ───── USAGE DATA (mock for current sub) ───── */
  const usage = { aiUsed: 45, aiTotal: 100, storageUsed: 2.3, storageTotal: 10, projectsUsed: 3, projectsTotal: 10 };

  return (
    <div className="space-y-8 animate-fade-in pb-8">
      {/* ──── HEADER ──── */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl md:text-3xl font-black text-foreground tracking-wide">
          Выберите план для работы в{" "}
          <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">BUILDVERSE</span>
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Гибкие тарифы для частных застройщиков, профессионалов и компаний. Начните бесплатно — масштабируйтесь по мере роста.
        </p>
      </div>

      {/* ──── PERIOD TOGGLE ──── */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setYearly(false)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!yearly ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}
        >
          Ежемесячно
        </button>
        <button
          onClick={() => setYearly(true)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${yearly ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}
        >
          Ежегодно <span className="text-green-400 ml-1">−17%</span>
        </button>
      </div>

      {/* ──── PLAN CARDS ──── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`glass-card rounded-2xl p-5 flex flex-col relative transition-all hover:scale-[1.02] ${plan.accentClass} ${plan.popular ? "glass-glow" : ""}`}
          >
            {/* Badge */}
            <span className={`inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-semibold mb-3 ${plan.badgeColor}`}>
              {plan.badge}
            </span>

            {/* Price */}
            <div className="mb-1">
              <span className="text-3xl font-black text-foreground">{getPrice(plan)}</span>
              <span className="text-sm text-muted-foreground ml-1">{getPeriod(plan)}</span>
            </div>
            {yearly && plan.monthlyPrice > 0 && (
              <p className="text-xs text-muted-foreground/60 mb-2">
                или ₽{plan.monthlyPrice.toLocaleString("ru")} / мес
              </p>
            )}
            <p className="text-xs text-muted-foreground mb-4">{plan.audience}</p>

            {/* Features */}
            <div className="flex-1 space-y-2 mb-5">
              {plan.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  {f.included ? (
                    <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <XIcon className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                  )}
                  <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            {plan.id === currentPlan ? (
              <Button disabled className="w-full glass-card text-muted-foreground border border-white/10">
                Текущий план
              </Button>
            ) : plan.id === "enterprise" ? (
              <Button
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                onClick={() => setShowPayment("enterprise")}
              >
                Связаться с отделом продаж
              </Button>
            ) : (
              <Button
                className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                onClick={() => {
                  setShowPayment(plan.id);
                  setPaymentSuccess(false);
                  setPromoApplied(false);
                  setPromoCode("");
                  setPaymentPeriod(yearly ? "yearly" : "monthly");
                }}
              >
                {plan.id === "pro" ? "Перейти на Pro" : "Перейти на Business"}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* ──── COMPARISON TABLE ──── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground text-center">Подробное сравнение возможностей</h3>
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 text-muted-foreground font-medium">Возможность</th>
                  {plans.map(p => (
                    <th key={p.id} className="p-3 text-center text-foreground font-bold">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-muted-foreground">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className={`p-3 text-center ${v === "✗" ? "text-muted-foreground/40" : v === "✓" ? "text-green-400" : "text-foreground"}`}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center">
          <Button variant="ghost" className="glass-card text-primary text-xs">
            Нужна помощь с выбором?
          </Button>
        </div>
      </div>

      {/* ──── PAYMENT METHODS ──── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground">Оплата и управление подпиской</h3>
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { icon: CreditCard, label: "Visa / MC / Мир" },
              { icon: Building2, label: "ЮKassa" },
              { icon: Zap, label: "CloudPayments" },
              { icon: Smartphone, label: "СБП" },
              { icon: FileText, label: "Безнал для юрлиц" },
            ].map((m, i) => (
              <div key={i} className="glass-card rounded-xl p-3 text-center space-y-1">
                <m.icon className="w-5 h-5 mx-auto text-primary" />
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>14 дней на возврат, если не использовали лимиты</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>Отмените подписку в любой момент</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <span>Безопасная оплата через защищённый шлюз</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── CURRENT SUBSCRIPTION (auth only) ──── */}
      {user && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Ваша текущая подписка</h3>
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Текущий тариф", value: "FREE" },
                { label: "Дата следующего списания", value: "—" },
                { label: "Сумма", value: "₽0" },
                { label: "Статус", value: "Активна", color: "text-green-400" },
              ].map((item, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className={`text-sm font-bold ${item.color || "text-foreground"}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Usage bars */}
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-medium">Использование лимитов</p>
              {[
                { label: "AI-запросы", used: usage.aiUsed, total: usage.aiTotal, unit: "" },
                { label: "Хранилище", used: usage.storageUsed, total: usage.storageTotal, unit: " GB" },
                { label: "Проекты", used: usage.projectsUsed, total: usage.projectsTotal, unit: "" },
              ].map((item, i) => {
                const pct = Math.round((item.used / item.total) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground">
                        {item.used}{item.unit} / {item.total}{item.unit}
                        <span className="text-muted-foreground/60 ml-1">{pct}%</span>
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    {pct >= 90 && (
                      <p className="text-[10px] text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Осталось {item.total - item.used}{item.unit} до конца месяца
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs"
                onClick={() => { setShowPayment("pro"); setPaymentSuccess(false); }}>
                Изменить тариф
              </Button>
              <Button size="sm" variant="ghost" className="glass-card text-destructive text-xs"
                onClick={() => { setShowCancel(true); setCancelDone(false); }}>
                Отменить подписку
              </Button>
              <Button size="sm" variant="ghost" className="glass-card text-foreground text-xs">
                <Download className="w-3.5 h-3.5 mr-1" /> Скачать чек
              </Button>
            </div>
          </div>

          {/* Payment History */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-foreground">История платежей</h4>
            <div className="text-center py-6 text-xs text-muted-foreground/50">
              Нет платежей
            </div>
          </div>
        </div>
      )}

      {/* ──── PAYMENT MODAL ──── */}
      <Dialog open={!!showPayment} onOpenChange={() => setShowPayment(null)}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-md">
          {selectedPlanData && (
            <>
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {selectedPlanData.id === "enterprise"
                    ? "Связаться с отделом продаж"
                    : `Оплата тарифа ${selectedPlanData.name}`}
                </DialogTitle>
                <DialogDescription>
                  {selectedPlanData.id === "enterprise"
                    ? "Оставьте заявку — мы свяжемся с вами в течение 24 часов"
                    : "Выберите период и способ оплаты"}
                </DialogDescription>
              </DialogHeader>

              {paymentSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <Check className="w-7 h-7 text-green-400" />
                  </div>
                  <p className="text-primary font-bold">Оплата прошла успешно!</p>
                  <p className="text-xs text-muted-foreground">Тариф активирован</p>
                  <Button variant="ghost" className="glass-card text-foreground" onClick={() => setShowPayment(null)}>
                    Перейти в личный кабинет
                  </Button>
                </div>
              ) : selectedPlanData.id === "enterprise" ? (
                <div className="space-y-3">
                  {[["Имя", "text"], ["Email", "email"], ["Компания", "text"], ["Телефон", "tel"]].map(([label, type]) => (
                    <div key={label} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{label}</Label>
                      <Input type={type} className="bg-white/5 border-white/10 text-foreground" />
                    </div>
                  ))}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Комментарий</Label>
                    <Input className="bg-white/5 border-white/10 text-foreground" />
                  </div>
                  <Button className="w-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                    onClick={handlePay}>
                    Отправить заявку
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Period */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Период</Label>
                    <div className="flex gap-2">
                      {(["monthly", "yearly"] as const).map((p) => (
                        <button key={p} onClick={() => setPaymentPeriod(p)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${paymentPeriod === p ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}>
                          {p === "monthly" ? "Ежемесячно" : "Ежегодно −17%"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Method */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Способ оплаты</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "card", label: "Карта", icon: CreditCard },
                        { id: "sbp", label: "СБП", icon: Smartphone },
                        { id: "invoice", label: "Счёт", icon: FileText },
                      ].map((m) => (
                        <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs transition-all ${paymentMethod === m.id ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}>
                          <m.icon className="w-4 h-4" />
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Промокод</Label>
                    <div className="flex gap-2">
                      <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                        className="bg-white/5 border-white/10 text-foreground text-sm" placeholder="Введите промокод" />
                      <Button size="sm" variant="ghost" className="glass-card text-primary text-xs shrink-0"
                        onClick={handleApplyPromo}>
                        Применить
                      </Button>
                    </div>
                    {promoApplied && <p className="text-[10px] text-green-400">Скидка 10% применена</p>}
                  </div>

                  {/* Total */}
                  <div className="glass-card rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Сумма</span>
                      <span className="text-foreground">
                        ₽{(paymentPeriod === "yearly" ? selectedPlanData.yearlyPrice : selectedPlanData.monthlyPrice).toLocaleString("ru")}
                      </span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-xs">
                        <span className="text-green-400">Скидка</span>
                        <span className="text-green-400">
                          −₽{Math.round((paymentPeriod === "yearly" ? selectedPlanData.yearlyPrice : selectedPlanData.monthlyPrice) * 0.1).toLocaleString("ru")}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2">
                      <span className="text-foreground">К оплате</span>
                      <span className="text-primary">₽{paymentTotal().toLocaleString("ru")}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-11"
                    onClick={handlePay}>
                    {paymentMethod === "invoice" ? "Сгенерировать счёт" : "Оплатить"}
                  </Button>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ──── CANCEL MODAL ──── */}
      <Dialog open={showCancel} onOpenChange={setShowCancel}>
        <DialogContent className="glass-card border-white/10 bg-background/95 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground">Отмена подписки</DialogTitle>
            <DialogDescription>
              {cancelDone
                ? "Подписка отменена. Доступ сохранится до конца оплаченного периода."
                : "Вы уверены? Доступ к функциям тарифа сохранится до конца оплаченного периода."}
            </DialogDescription>
          </DialogHeader>
          {cancelDone ? (
            <Button variant="ghost" className="w-full glass-card text-foreground" onClick={() => setShowCancel(false)}>
              Закрыть
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Причина отмены</Label>
                <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-foreground">
                  <option value="">Выберите причину</option>
                  <option>Дорого</option>
                  <option>Не использую</option>
                  <option>Нашёл альтернативу</option>
                  <option>Другое</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1 glass-card text-foreground" onClick={() => setShowCancel(false)}>
                  Отменить
                </Button>
                <Button className="flex-1 bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
                  onClick={() => setCancelDone(true)}>
                  Подтвердить отмену
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingPage;
