import { ChevronRight } from "lucide-react";

interface Props {
  faturaAtual: number;
  showBalance: boolean;
  loading: boolean;
  formatCurrency: (v: number) => string;
}

const PainelCartao = ({ faturaAtual, showBalance, loading, formatCurrency }: Props) => (
  <section className="px-5 py-6">
    <div className="flex items-center justify-between mb-1">
      <h3 className="text-base font-bold text-foreground font-heading">Cartão de crédito</h3>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-sm text-muted-foreground font-body">Fatura atual</p>
    <p className="text-2xl font-bold text-foreground font-heading mt-2">
      {loading ? "Carregando..." : showBalance ? formatCurrency(faturaAtual) : "••••••"}
    </p>
    <p className="text-xs text-muted-foreground mt-1 font-body">
      {faturaAtual > 0 ? "Fatura aberta" : "Sem fatura no momento"}
    </p>
  </section>
);

export default PainelCartao;
