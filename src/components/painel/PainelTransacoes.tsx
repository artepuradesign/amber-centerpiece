import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Transacao {
  id: number;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: string;
  data_transacao: string;
  beneficiario_nome: string | null;
}

interface Props {
  transacoes: Transacao[];
  showBalance: boolean;
  loading: boolean;
  formatCurrency: (v: number) => string;
}

const PainelTransacoes = ({ transacoes, showBalance, loading, formatCurrency }: Props) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <section className="px-5 py-6">
      <h3 className="text-base font-bold text-foreground font-heading mb-4">Últimas movimentações</h3>
      {loading ? (
        <p className="text-sm text-muted-foreground font-body">Carregando...</p>
      ) : transacoes.length === 0 ? (
        <p className="text-sm text-muted-foreground font-body">Nenhuma movimentação ainda.</p>
      ) : (
        <div className="space-y-4">
          {transacoes.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${t.tipo === "entrada" ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {t.tipo === "entrada" ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-foreground font-body">{t.descricao}</p>
                  <p className="text-xs text-muted-foreground font-body">{formatDate(t.data_transacao)}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold font-heading ${t.tipo === "entrada" ? "text-green-600" : "text-foreground"}`}>
                {showBalance
                  ? `${t.tipo === "saida" ? "- " : "+ "}${formatCurrency(parseFloat(t.valor))}`
                  : "••••••"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PainelTransacoes;
