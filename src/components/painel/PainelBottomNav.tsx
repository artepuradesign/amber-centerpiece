import { ArrowUpDown, DollarSign, ShoppingBag } from "lucide-react";

const PainelBottomNav = () => (
  <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
    <div className="flex items-center gap-2 bg-background/95 backdrop-blur-lg border border-border rounded-full px-6 py-3 shadow-lg">
      <button className="flex flex-col items-center gap-1 px-4 py-1 rounded-full bg-secondary">
        <ArrowUpDown className="h-5 w-5 text-foreground" />
      </button>
      <button className="flex flex-col items-center gap-1 px-4 py-1">
        <DollarSign className="h-5 w-5 text-muted-foreground" />
      </button>
      <button className="flex flex-col items-center gap-1 px-4 py-1">
        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
      </button>
    </div>
  </nav>
);

export default PainelBottomNav;
