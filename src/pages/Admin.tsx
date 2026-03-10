import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LogOut, Plus, FileText, Users, TrendingUp, TrendingDown, DollarSign, Download,
} from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import logoNu from "@/assets/logonu.png";

interface Usuario {
  id: number;
  email: string;
  tipo_conta: string;
  status: string;
  nome: string;
  documento: string;
  telefone_pf: string | null;
  telefone_pj: string | null;
  conta_id: number;
  numero_conta: string;
  agencia: string;
  saldo: number;
  created_at: string;
}

interface ContaOption {
  conta_id: number;
  titular: string;
  documento: string;
  numero_conta: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [contas, setContas] = useState<ContaOption[]>([]);
  const [selectedConta, setSelectedConta] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Auth check - redirect if not admin
  useEffect(() => {
    const user = localStorage.getItem("nu_user") || sessionStorage.getItem("nu_user");
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(user);
      if (!parsed.is_admin) {
        navigate("/painel");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // Extrato state
  const [extratoData, setExtratoData] = useState<any>(null);
  const [extratoLoading, setExtratoLoading] = useState(false);

  // Nova transação
  const [novaTransacao, setNovaTransacao] = useState({
    data: "", tipo: "entrada" as "entrada" | "saida", descricao: "Transferência recebida pelo Pix",
    categoria: "PIX", valor: "", beneficiario: "", documento: "", banco: "", agencia: "", conta: "",
  });

  const fetchUsuarios = useCallback(async () => {
    try {
      const res = await apiGet<{ usuarios: Usuario[] }>("admin.php", { action: "usuarios" });
      setUsuarios(res.usuarios);
      // Build contas list from usuarios
      const contasList: ContaOption[] = res.usuarios
        .filter(u => u.conta_id)
        .map(u => ({
          conta_id: u.conta_id,
          titular: u.nome,
          documento: u.documento,
          numero_conta: u.numero_conta,
        }));
      setContas(contasList);
      if (contasList.length > 0 && !selectedConta) {
        setSelectedConta(String(contasList[0].conta_id));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao carregar usuários";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedConta]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // Load extrato when conta changes
  const fetchExtrato = useCallback(async (contaId: string) => {
    if (!contaId) return;
    setExtratoLoading(true);
    try {
      const res = await apiGet<any>("admin.php", {
        action: "transacoes",
        conta_id: contaId,
      });
      setExtratoData(res);
    } catch {
      toast.error("Erro ao carregar extrato");
    } finally {
      setExtratoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConta) fetchExtrato(selectedConta);
  }, [selectedConta, fetchExtrato]);

  const handleAddTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConta) {
      toast.error("Selecione uma conta primeiro");
      return;
    }
    try {
      await apiPost("admin.php", {
        action: "criar_transacao",
        conta_id: parseInt(selectedConta),
        tipo: novaTransacao.tipo,
        categoria: novaTransacao.categoria,
        descricao: novaTransacao.descricao,
        valor: parseFloat(novaTransacao.valor),
        data_transacao: novaTransacao.data,
        beneficiario_nome: novaTransacao.beneficiario,
        beneficiario_documento: novaTransacao.documento,
        beneficiario_banco: novaTransacao.banco,
        beneficiario_agencia: novaTransacao.agencia,
        beneficiario_conta: novaTransacao.conta,
      });
      toast.success("Lançamento adicionado com sucesso!");
      setNovaTransacao({
        data: "", tipo: "entrada", descricao: "Transferência recebida pelo Pix",
        categoria: "PIX", valor: "", beneficiario: "", documento: "", banco: "", agencia: "", conta: "",
      });
      fetchExtrato(selectedConta);
      fetchUsuarios();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar transação");
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      await apiPost("admin.php", { action: "ativar_usuario", usuario_id: userId, status: newStatus });
      toast.success(`Usuário ${newStatus === "ativo" ? "ativado" : "bloqueado"} com sucesso!`);
      fetchUsuarios();
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Extrato computed values
  const resumo = extratoData?.resumo || { saldo_inicial: 0, total_entradas: 0, total_saidas: 0, rendimento_liquido: 0, saldo_final: 0 };
  const contaInfo = extratoData?.conta || {};
  const movimentacoes = extratoData?.movimentacoes || {};
  const datasOrdenadas = Object.keys(movimentacoes).sort();

  // Summary cards use selected conta data
  const selectedUser = usuarios.find(u => String(u.conta_id) === selectedConta);

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Admin Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-extrabold nu-text-gradient">NU</h1>
            <span className="text-sm text-muted-foreground font-medium bg-secondary px-3 py-1 rounded-full">Administração</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            localStorage.removeItem("nu_user");
            sessionStorage.removeItem("nu_user");
            navigate("/login");
          }}>
            <LogOut className="h-4 w-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Conta selector */}
        {contas.length > 0 && (
          <div className="mb-6">
            <Label className="text-sm text-muted-foreground mb-2 block">Conta selecionada</Label>
            <Select value={selectedConta} onValueChange={setSelectedConta}>
              <SelectTrigger className="w-full md:w-96">
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {contas.map(c => (
                  <SelectItem key={c.conta_id} value={String(c.conta_id)}>
                    {c.titular} - {c.documento} (Conta: {c.numero_conta})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Saldo Atual", value: selectedUser ? parseFloat(String(selectedUser.saldo)) : 0, icon: DollarSign, color: "text-primary" },
            { label: "Total Entradas", value: resumo.total_entradas, icon: TrendingUp, color: "text-nu-green", prefix: "+" },
            { label: "Total Saídas", value: resumo.total_saidas, icon: TrendingDown, color: "text-destructive", prefix: "-" },
            { label: "Saldo Final Período", value: resumo.saldo_final, icon: DollarSign, color: "text-foreground" },
          ].map((c, i) => (
            <Card key={i} className="nu-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>
                  {c.prefix || ""}R$ {formatCurrency(c.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="lancamentos">
          <TabsList className="mb-6">
            <TabsTrigger value="lancamentos" className="flex gap-2"><Plus className="h-4 w-4" /> Lançamentos</TabsTrigger>
            <TabsTrigger value="extrato" className="flex gap-2"><FileText className="h-4 w-4" /> Extrato</TabsTrigger>
            <TabsTrigger value="clientes" className="flex gap-2"><Users className="h-4 w-4" /> Clientes</TabsTrigger>
            <TabsTrigger value="exportar" className="flex gap-2"><Download className="h-4 w-4" /> Exportar Extrato</TabsTrigger>
          </TabsList>

          {/* Lançamentos */}
          <TabsContent value="lancamentos">
            <Card className="nu-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Novo Lançamento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTransacao} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Data *</Label>
                      <Input type="date" required value={novaTransacao.data} onChange={e => setNovaTransacao(p => ({ ...p, data: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Tipo *</Label>
                      <Select value={novaTransacao.tipo} onValueChange={v => setNovaTransacao(p => ({ ...p, tipo: v as "entrada" | "saida" }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor (R$) *</Label>
                      <Input type="number" step="0.01" required value={novaTransacao.valor} onChange={e => setNovaTransacao(p => ({ ...p, valor: e.target.value }))} placeholder="0,00" />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select value={novaTransacao.categoria} onValueChange={v => setNovaTransacao(p => ({ ...p, categoria: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="TED">TED</SelectItem>
                          <SelectItem value="BOLETO">Boleto</SelectItem>
                          <SelectItem value="ESTORNO">Estorno</SelectItem>
                          <SelectItem value="RENDIMENTO">Rendimento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label>Descrição</Label>
                      <Input value={novaTransacao.descricao} onChange={e => setNovaTransacao(p => ({ ...p, descricao: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Beneficiário/Pagador *</Label>
                      <Input required value={novaTransacao.beneficiario} onChange={e => setNovaTransacao(p => ({ ...p, beneficiario: e.target.value }))} />
                    </div>
                    <div>
                      <Label>CPF/CNPJ</Label>
                      <Input value={novaTransacao.documento} onChange={e => setNovaTransacao(p => ({ ...p, documento: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Banco</Label>
                      <Input value={novaTransacao.banco} onChange={e => setNovaTransacao(p => ({ ...p, banco: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Agência</Label>
                      <Input value={novaTransacao.agencia} onChange={e => setNovaTransacao(p => ({ ...p, agencia: e.target.value }))} />
                    </div>
                    <div>
                      <Label>Conta</Label>
                      <Input value={novaTransacao.conta} onChange={e => setNovaTransacao(p => ({ ...p, conta: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" variant="hero">
                    <Plus className="h-4 w-4 mr-2" /> Adicionar lançamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Extrato */}
          <TabsContent value="extrato">
            <Card className="nu-card border-0">
              <CardContent className="pt-6">
                {extratoLoading ? (
                  <p className="text-muted-foreground text-center py-8">Carregando extrato...</p>
                ) : !selectedConta ? (
                  <p className="text-muted-foreground text-center py-8">Selecione uma conta para visualizar o extrato.</p>
                ) : (
                  <ExtratoPreview contaInfo={contaInfo} resumo={resumo} movimentacoes={movimentacoes} datasOrdenadas={datasOrdenadas} extratoData={extratoData} formatCurrency={formatCurrency} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clientes */}
          <TabsContent value="clientes">
            <Card className="nu-card border-0">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Clientes cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Carregando...</p>
                ) : errorMsg ? (
                  <div className="text-center py-4">
                    <p className="text-destructive mb-2">Erro ao carregar clientes:</p>
                    <p className="text-sm text-muted-foreground">{errorMsg}</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={fetchUsuarios}>Tentar novamente</Button>
                  </div>
                ) : usuarios.length === 0 ? (
                  <p className="text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Documento</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuarios.map(u => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.nome || "—"}</TableCell>
                          <TableCell className="text-sm">{u.documento || "—"}</TableCell>
                          <TableCell>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-foreground">
                              {u.tipo_conta}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">{u.email}</TableCell>
                          <TableCell className="text-sm">{u.numero_conta || "—"}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              u.status === "ativo" ? "bg-nu-green/10 text-nu-green" :
                              u.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                              "bg-destructive/10 text-destructive"
                            }`}>
                              {u.status === "ativo" ? "Ativo" : u.status === "pendente" ? "Pendente" : "Bloqueado"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            R$ {formatCurrency(parseFloat(String(u.saldo || 0)))}
                          </TableCell>
                          <TableCell>
                            {u.status === "pendente" && (
                              <Button size="sm" variant="outline" className="text-nu-green border-nu-green hover:bg-nu-green/10" onClick={() => handleStatusChange(u.id, "ativo")}>
                                Ativar
                              </Button>
                            )}
                            {u.status === "ativo" && (
                              <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => handleStatusChange(u.id, "bloqueado")}>
                                Bloquear
                              </Button>
                            )}
                            {u.status === "bloqueado" && (
                              <Button size="sm" variant="outline" className="text-nu-green border-nu-green hover:bg-nu-green/10" onClick={() => handleStatusChange(u.id, "ativo")}>
                                Reativar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exportar Extrato */}
          <TabsContent value="exportar">
            <ExportarExtrato selectedConta={selectedConta} contaInfo={contaInfo} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Export component
function ExportarExtrato({ selectedConta, contaInfo }: { selectedConta: string; contaInfo: any }) {
  const navigate = useNavigate();
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const handleContinuar = () => {
    if (!selectedConta) {
      toast.error("Selecione uma conta primeiro");
      return;
    }
    if (!dataInicio || !dataFim) {
      toast.error("Selecione o período");
      return;
    }
    navigate(`/extrato-export?conta_id=${selectedConta}&data_inicio=${dataInicio}&data_fim=${dataFim}`);
  };

  return (
    <Card className="nu-card border-0">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">Exportar Extrato em PDF</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-6">
          Selecione o período desejado para gerar uma pré-visualização do extrato no formato A4, pronto para exportar como PDF.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label>Data início *</Label>
            <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} required />
          </div>
          <div>
            <Label>Data fim *</Label>
            <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} required />
          </div>
        </div>
        <Button variant="hero" onClick={handleContinuar}>
          <FileText className="h-4 w-4 mr-2" /> Continuar
        </Button>
      </CardContent>
    </Card>
  );
}

export default Admin;
