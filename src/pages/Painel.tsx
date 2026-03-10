import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "@/lib/api";
import PainelHeader from "@/components/painel/PainelHeader";
import PainelSaldo from "@/components/painel/PainelSaldo";
import PainelQuickActions from "@/components/painel/PainelQuickActions";
import PainelBanner from "@/components/painel/PainelBanner";
import PainelCartao from "@/components/painel/PainelCartao";
import PainelTransacoes from "@/components/painel/PainelTransacoes";
import PainelDescubra from "@/components/painel/PainelDescubra";
import PainelBottomNav from "@/components/painel/PainelBottomNav";

interface ContaData {
  conta_id: number;
  titular: string | null;
  documento: string | null;
  email: string;
  telefone: string | null;
  tipo_conta: string;
  agencia: string;
  numero_conta: string;
  saldo: number;
  limite_credito: number;
  conta_status: string;
}

interface Transacao {
  id: number;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: string;
  saldo_anterior: string;
  saldo_posterior: string;
  data_transacao: string;
  beneficiario_nome: string | null;
  codigo_autenticacao: string;
}

interface ContaResponse {
  conta: ContaData;
  fatura_atual: number;
  transacoes: Transacao[];
}

const Painel = () => {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<{ id: number; email: string; tipo_conta: string } | null>(null);
  const [contaData, setContaData] = useState<ContaData | null>(null);
  const [faturaAtual, setFaturaAtual] = useState(0);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("nu_user") || sessionStorage.getItem("nu_user");
    if (!saved) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(saved));
  }, [navigate]);

  const fetchContaData = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const data = await apiGet<ContaResponse>("conta.php", { usuario_id: String(userId) });
      setContaData(data.conta);
      setFaturaAtual(data.fatura_atual);
      setTransacoes(data.transacoes);
    } catch (err) {
      console.error("Erro ao carregar dados da conta:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchContaData(user.id);
    }
  }, [user, fetchContaData]);

  const handleLogout = () => {
    localStorage.removeItem("nu_user");
    sessionStorage.removeItem("nu_user");
    navigate("/login");
  };

  if (!user) return null;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const primeiroNome = contaData?.titular?.split(" ")[0] || user.email.charAt(0).toUpperCase();
  const inicialNome = (contaData?.titular || user.email).charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background font-body pb-28">
      <PainelHeader
        inicialNome={inicialNome}
        showBalance={showBalance}
        onToggleBalance={() => setShowBalance(!showBalance)}
      />

      <PainelSaldo
        saldo={contaData?.saldo ?? 0}
        showBalance={showBalance}
        loading={loading}
        formatCurrency={formatCurrency}
      />

      <PainelQuickActions />

      <PainelBanner />

      <div className="h-px bg-border mx-5" />

      <PainelCartao
        faturaAtual={faturaAtual}
        showBalance={showBalance}
        loading={loading}
        formatCurrency={formatCurrency}
      />

      <div className="h-px bg-border mx-5" />

      <PainelTransacoes
        transacoes={transacoes}
        showBalance={showBalance}
        loading={loading}
        formatCurrency={formatCurrency}
      />

      <div className="h-px bg-border mx-5" />

      <PainelDescubra />

      <section className="px-5 pb-8">
        <button onClick={handleLogout} className="text-sm text-destructive font-medium hover:underline font-body">
          Sair da conta
        </button>
      </section>

      <PainelBottomNav />
    </div>
  );
};

export default Painel;
