import { ChevronRight } from "lucide-react";

interface Props {
  saldo: number;
  showBalance: boolean;
  loading: boolean;
  formatCurrency: (v: number) => string;
}

const PainelSaldo = ({ saldo, showBalance, loading, formatCurrency }: Props) => (
  <section className="px-5 py-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground font-body">Saldo em conta</p>
        <p className="text-2xl font-bold text-foreground font-heading mt-1">
          {loading ? "Carregando..." : showBalance ? formatCurrency(saldo) : "••••••"}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
  </section>
);

export default PainelSaldo;
