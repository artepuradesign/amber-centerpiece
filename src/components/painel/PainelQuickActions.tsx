import { Grid3X3, BarChart3, Landmark, CalendarDays, Smartphone, CreditCard } from "lucide-react";

const quickActions = [
  { icon: Grid3X3, label: "Área Pix e\nTransferir" },
  { icon: BarChart3, label: "Pagar" },
  { icon: Landmark, label: "Pegar\nemprestado", badge: "FGTS" },
  { icon: CalendarDays, label: "Ajuda\nfinanceira", badge: "Descontos" },
  { icon: Smartphone, label: "Recarga\ncelular" },
  { icon: CreditCard, label: "Cobrar" },
];

const PainelQuickActions = () => (
  <section className="px-5 pb-6">
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {quickActions.map((action, i) => (
        <button key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center relative">
            <action.icon className="h-6 w-6 text-foreground" />
            {action.badge && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}
          </div>
          <span className="text-xs text-foreground text-center leading-tight whitespace-pre-line font-body">
            {action.label}
          </span>
        </button>
      ))}
    </div>
  </section>
);

export default PainelQuickActions;
