import { Brain, Bell, Calculator, HardHat, Send } from "lucide-react";
import { Input } from "@/components/ui/input";

const RightSidebar = () => {
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-64 shrink-0 p-2 overflow-y-auto scrollbar-none">
      {/* AI Assistant */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">СтройМакс AI</h3>
        </div>
        <div className="space-y-2">
          <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Привет! Я ваш AI-ассистент. Задайте вопрос о строительстве.
          </div>
          <div className="bg-primary/10 rounded-lg px-3 py-2 text-xs text-foreground ml-4">
            Какой фундамент лучше для глинистой почвы?
          </div>
          <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            Для глинистой почвы рекомендую свайно-ростверковый фундамент. Он обеспечит надёжность при пучении грунта.
          </div>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Спросить..." className="bg-white/10 border-white/15 text-xs h-8 text-foreground placeholder:text-muted-foreground focus-visible:ring-0" />
          <button className="text-primary hover:text-primary/80 p-1"><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Уведомления</h3>
          <span className="ml-auto bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">3</span>
        </div>
        <div className="text-xs text-muted-foreground space-y-1.5">
          <p>• Новый тендер в вашем регионе</p>
          <p>• Обновление цен на бетон М300</p>
          <p>• Подрядчик принял заявку</p>
        </div>
      </div>

      {/* Mini estimate */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Мини-смета</h3>
        </div>
        <div className="text-xs space-y-1">
          <div className="flex justify-between text-muted-foreground"><span>Фундамент</span><span className="text-foreground">2.1 млн</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Каркас</span><span className="text-foreground">4.8 млн</span></div>
          <div className="flex justify-between text-muted-foreground"><span>Отделка</span><span className="text-foreground">3.2 млн</span></div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex justify-between font-bold text-foreground"><span>Итого</span><span className="text-primary">10.1 млн ₽</span></div>
        </div>
      </div>

      {/* Contractors */}
      <div className="glass-card rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-2">
          <HardHat className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Подрядчики</h3>
        </div>
        <div className="text-xs space-y-2">
          {[
            { name: "СтройПро", rating: "4.9", spec: "Фундамент" },
            { name: "ЭкоДом", rating: "4.7", spec: "Каркас" },
            { name: "МастерОтделки", rating: "4.8", spec: "Отделка" },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">{c.name}</p>
                <p className="text-muted-foreground">{c.spec}</p>
              </div>
              <span className="text-primary">★ {c.rating}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
