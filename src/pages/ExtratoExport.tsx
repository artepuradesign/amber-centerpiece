import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { apiGet } from "@/lib/api";

const ExtratoExport = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const contaId = searchParams.get("conta_id") || "";
  const dataInicio = searchParams.get("data_inicio") || "";
  const dataFim = searchParams.get("data_fim") || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!contaId || !dataInicio || !dataFim) return;
    apiGet("admin.php", { action: "transacoes", conta_id: contaId, data_inicio: dataInicio, data_fim: dataFim })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contaId, dataInicio, dataFim]);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando extrato...</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Erro ao carregar extrato.</div>;
  }

  const conta = data.conta || {};
  const resumo = data.resumo || {};
  const movimentacoes = data.movimentacoes || {};
  const datasOrdenadas = Object.keys(movimentacoes).sort();

  const periodoInicio = new Date(dataInicio + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();
  const periodoFim = new Date(dataFim + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).toUpperCase();

  return (
    <>
      {/* Controls - hidden on print */}
      <div className="print:hidden bg-secondary/30 border-b border-border px-6 py-4 flex items-center gap-4 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-foreground flex-1">Pré-visualização do Extrato</h1>
        <Button variant="hero" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> Imprimir / Salvar PDF
        </Button>
      </div>

      {/* A4 page container */}
      <div className="flex justify-center py-8 print:py-0 bg-secondary/30 print:bg-white min-h-screen">
        <div className="bg-white shadow-lg print:shadow-none w-[210mm] min-h-[297mm] px-[20mm] py-[15mm] text-black text-[11px] leading-relaxed font-body print:w-full print:min-h-0 print:px-[15mm] print:py-[10mm]">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-300">
            <div>
              <h2 className="text-3xl font-extrabold text-purple-700 mb-1">Nu</h2>
              <p className="text-[9px] text-gray-500">Nu Pagamentos S.A.</p>
            </div>
            <div className="text-right text-[10px] text-gray-600">
              <p className="font-semibold text-black">{conta.titular}</p>
              <p>
                <span className="font-semibold text-purple-700">{conta.tipo_conta === "PJ" ? "CNPJ" : "CPF"}</span> {conta.documento}{" "}
                <span className="font-semibold">Agência</span> {conta.agencia || "0001"}{" "}
                <span className="font-semibold">Conta</span> {conta.numero_conta}
              </p>
            </div>
          </div>

          {/* Period */}
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-300">
            <h3 className="font-bold text-black text-[11px]">{periodoInicio} a {periodoFim}</h3>
            <span className="text-[9px] text-gray-500">VALORES EM R$</span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-300">
            <div>
              <p className="text-[9px] text-gray-500 mb-1">Saldo final do período</p>
              <p className="text-xl font-bold text-black">R$ {formatCurrency(resumo.saldo_final)}</p>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between"><span className="text-gray-500">Saldo inicial</span><span className="font-medium">{formatCurrency(resumo.saldo_inicial)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rendimento líquido</span><span className="font-medium">+{formatCurrency(resumo.rendimento_liquido)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total de entradas</span><span className="font-medium text-green-700">+{formatCurrency(resumo.total_entradas)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total de saídas</span><span className="font-medium text-red-600">-{formatCurrency(resumo.total_saidas)}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-semibold">Saldo final</span><span className="font-bold">{formatCurrency(resumo.saldo_final)}</span></div>
            </div>
          </div>

          {/* Movimentações */}
          <h3 className="font-bold text-black text-[11px] mb-4">Movimentações</h3>

          {datasOrdenadas.length === 0 && (
            <p className="text-gray-500 text-center py-4">Nenhuma movimentação encontrada no período.</p>
          )}

          {datasOrdenadas.map(dia => {
            const trans = movimentacoes[dia];
            const entradas = trans.filter((t: any) => t.tipo === "entrada");
            const saidas = trans.filter((t: any) => t.tipo === "saida");
            const totalE = entradas.reduce((s: number, t: any) => s + parseFloat(t.valor), 0);
            const totalS = saidas.reduce((s: number, t: any) => s + parseFloat(t.valor), 0);

            const diaFormatado = new Date(dia + "T12:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit", month: "short", year: "numeric",
            }).toUpperCase().replace(".", "");

            return (
              <div key={dia} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                <h4 className="font-bold text-[10px] text-black mb-2">{diaFormatado}</h4>

                {entradas.length > 0 && (
                  <>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-[10px]">Total de entradas</span>
                      <span className="font-semibold text-[10px] text-green-700">+ {formatCurrency(totalE)}</span>
                    </div>
                    {entradas.map((t: any) => (
                      <div key={t.id} className="flex justify-between py-1 pl-3 text-[10px]">
                        <div>
                          <p className="text-gray-600">{t.descricao}</p>
                          <p className="text-[9px] text-gray-400">
                            {t.beneficiario_nome} - {t.beneficiario_documento} - {t.beneficiario_banco} Ag: {t.beneficiario_agencia} Cc: {t.beneficiario_conta}
                          </p>
                        </div>
                        <span className="font-medium whitespace-nowrap ml-3">{formatCurrency(parseFloat(t.valor))}</span>
                      </div>
                    ))}
                  </>
                )}

                {saidas.length > 0 && (
                  <>
                    <div className="flex justify-between mb-1 mt-2">
                      <span className="font-semibold text-[10px]">Total de saídas</span>
                      <span className="font-semibold text-[10px] text-red-600">- {formatCurrency(totalS)}</span>
                    </div>
                    {saidas.map((t: any) => (
                      <div key={t.id} className="flex justify-between py-1 pl-3 text-[10px]">
                        <div>
                          <p className="text-gray-600">{t.descricao}</p>
                          <p className="text-[9px] text-gray-400">
                            {t.beneficiario_nome} - {t.beneficiario_documento} - {t.beneficiario_banco} Ag: {t.beneficiario_agencia} Cc: {t.beneficiario_conta}
                          </p>
                        </div>
                        <span className="font-medium whitespace-nowrap ml-3">{formatCurrency(parseFloat(t.valor))}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}

          {/* Footer */}
          <div className="text-[9px] text-gray-400 mt-8 pt-3 border-t border-gray-300 space-y-1">
            <p>Tem alguma dúvida? Mande uma mensagem para nosso time de atendimento pelo chat do app ou ligue 4020 0185.</p>
            <p>Extrato gerado dia {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExtratoExport;
