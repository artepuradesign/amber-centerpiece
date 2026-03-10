import { ChevronRight } from "lucide-react";

interface Props {
  saldo: number;
  showBalance: boolean;
  loading: boolean;
  formatCurrency: (v: number) => string;
}

const PainelSaldo = ({ saldo, showBalance, loading, formatCurrency }: Props) =>
<section className="px-5 py-5">
    <div className="flex items-center justify-between mb-1">
      <p className="text-lg text-foreground font-body">Saldo em Conta</p>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-2xl font-bold text-foreground font-heading mt-2">
      {loading ? "Carregando..." : showBalance ? formatCurrency(saldo) : "••••••"}
    </p>
  </section>;


export default PainelSaldo;