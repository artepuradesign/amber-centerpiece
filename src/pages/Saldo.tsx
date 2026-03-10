import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, MoreHorizontal, Plus, Send, BarChart3, TrendingUp, Wallet, DollarSign, ArrowUpRight, Search, BarChart2 } from "lucide-react";
import { apiGet } from "@/lib/api";

interface ContaData {
  saldo: number;
  limite_credito: number;
}

interface Transacao {
  id: number;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: string;
  data_transacao: string;
  beneficiario_nome: string | null;
}

interface ContaResponse {
  conta: ContaData;
  fatura_atual: number;
  transacoes: Transacao[];
}

const Saldo = () => {
  const navigate = useNavigate();
  const [contaData, setContaData] = useState<ContaData | null>(null);
  const [faturaAtual, setFaturaAtual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("nu_user") || sessionStorage.getItem("nu_user");
    if (!saved) {
      navigate("/login");
      return;
    }
    const user = JSON.parse(saved);
    fetchData(user.id);
  }, [navigate]);

  const fetchData = async (userId: number) => {
    try {
      setLoading(true);
      const data = await apiGet<ContaResponse>("conta.php", { usuario_id: String(userId) });
      setContaData(data.conta);
      setFaturaAtual(data.fatura_atual);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const saldo = contaData?.saldo ?? 0;

  const quickActions = [
    { icon: Plus, label: "Trazer\ndinheiro" },
    { icon: Send, label: "Transferir" },
    { icon: BarChart3, label: "Pagar" },
    { icon: TrendingUp, label: "Investir e\nGuardar" },
  ];

  return (
    <div className="min-h-screen bg-background font-body max-w-md mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => navigate("/painel")} className="p-1">
          <ChevronLeft className="h-6 w-6 text-foreground" />
        </button>
        <div className="flex items-center gap-5">
          <button className="p-1">
            <HelpCircle className="h-6 w-6 text-muted-foreground" />
          </button>
          <button className="p-1">
            <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Saldo disponível */}
      <section className="px-5 pt-4 pb-6">
        <p className="text-base text-muted-foreground font-body mb-1">Saldo disponível</p>
        <p className="text-[32px] font-bold text-foreground font-heading leading-tight">
          {loading ? "Carregando..." : formatCurrency(saldo)}
        </p>
      </section>

      {/* Saldo Separado */}
      <button className="w-full px-5 py-4 flex items-center gap-4 active:bg-muted/50 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <Wallet className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground font-body">Saldo Separado</p>
          <p className="text-base font-semibold text-foreground font-heading">
            {loading ? "..." : formatCurrency(0)}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Gastos Previstos */}
      <button className="w-full px-5 py-4 flex items-center gap-4 active:bg-muted/50 transition-colors">
        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-foreground" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground font-body">Gastos Previstos</p>
          <p className="text-base font-semibold text-foreground font-heading">
            {loading ? "..." : formatCurrency(faturaAtual)}
          </p>
          <p className="text-xs text-muted-foreground font-body">Programar com Seu Assistente</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Total em investimentos */}
      <button className="w-full px-5 py-4 flex items-center gap-4 active:bg-muted/50 transition-colors">
        <div className="w-10 h-10 flex items-center justify-center">
          <span className="text-2xl font-bold text-foreground font-heading">$</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm text-muted-foreground font-body">Total em investimentos</p>
          <p className="text-base font-semibold text-foreground font-heading">
            {loading ? "..." : formatCurrency(1.60)}
          </p>
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5 text-nu-green" />
            <span className="text-xs text-nu-green font-body">{formatCurrency(3.15)}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>

      {/* Quick Actions */}
      <section className="px-5 py-6">
        <div className="flex justify-between gap-3">
          {quickActions.map((action, i) => (
            <button key={i} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-16 h-16 rounded-full bg-nu-purple-light flex items-center justify-center">
                <action.icon className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xs text-foreground text-center leading-tight whitespace-pre-line font-body">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Banner FGTS */}
      <section className="px-5 pb-6">
        <div className="bg-nu-purple-light rounded-2xl p-5 flex items-center gap-4">
          <p className="flex-1 text-sm text-foreground font-body leading-snug">
            Antecipe as parcelas do seu saque-aniversário FGTS.
          </p>
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex justify-center mt-3">
          <div className="w-2 h-2 rounded-full bg-foreground" />
        </div>
      </section>

      {/* Resumo financeiro */}
      <section className="px-5 pb-8">
        <h2 className="text-xl font-bold text-foreground font-heading mb-1">Resumo financeiro</h2>
        <p className="text-sm text-muted-foreground font-body">
          Confira a análise dos seus gastos de
        </p>
      </section>
    </div>
  );
};

export default Saldo;
