import { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Loading } from "../components/shared/Loading";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import {
  AlertTriangle,
  Wrench,
  Package,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Calendar,
} from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";

interface MaintenanceItem {
  id: string;
  originalId: string;
  type: "GAME" | "COPY";
  gameId?: string;
  title: string;
  cover: string | null;
  code: string;
  reason: string;
  date: string;
}

export function MaintenancePage({ onNavigate, onLogout }: any) {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const fetchMaintenanceItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/maintenance");
      setItems(res.data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar o painel de manutenção.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceItems();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResolve = async (item: MaintenanceItem) => {
    if (
      !window.confirm(
        `Deseja marcar "${item.title}" como resolvido e devolvê-lo ao acervo?`
      )
    )
      return;

    try {
      if (item.type === "GAME") {
        await api.patch(`/games/${item.originalId}`, {
          isActive: true,
          isVisible: true,
        });
      } else {
        await api.patch(`/games/copies/${item.originalId}`, {
          available: true,
        });
      }

      toast.success("Item resolvido e devolvido ao catálogo!");
      fetchMaintenanceItems();
    } catch (err) {
      toast.error("Erro ao tentar resolver o problema.");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        activePage="manutencao"
        onNavigate={onNavigate}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuToggle={() => setIsSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Cabeçalho Responsivo */}
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="bg-red-100 p-2.5 sm:p-3 rounded-2xl flex-shrink-0">
              <Wrench className="text-red-600 w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#04096D]">
                Painel de Avarias e Manutenção
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">
                Acompanhe e resolva problemas físicos no acervo
              </p>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorMessage message={error} onRetry={fetchMaintenanceItems} />
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-gray-100 shadow-sm mt-4 sm:mt-8">
              <CheckCircle2 size={56} className="text-green-500 mx-auto mb-3" />
              <h2 className="text-xl sm:text-2xl font-bold text-[#04096D]">
                Acervo Impecável!
              </h2>
              <p className="text-sm text-gray-500 mt-2">
                Nenhum jogo ou caixa precisa de manutenção no momento.
              </p>
            </div>
          ) : (
            <>
              {/* VERSÃO MOBILE: Cards Verticais (ocultos em telas md ou maiores) */}
              <div className="space-y-4 md:hidden">
                {items.map((item) => {
                  const isLongText = (item.reason || "").length > 110;
                  const isExpanded = !!expandedItems[item.id];

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col gap-3.5"
                    >
                      {/* Topo do Card */}
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {item.cover ? (
                            <img
                              src={item.cover}
                              alt="Capa"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[#04096D] text-sm leading-snug line-clamp-1">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            <span
                              className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                item.type === "GAME"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {item.type === "GAME" ? "JOGO" : "CÓPIA"}
                            </span>
                            <span className="text-xs font-mono font-bold text-gray-500">
                              {item.code}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 flex-shrink-0">
                          <Calendar size={13} className="text-gray-400" />
                          <span>{new Date(item.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Motivo do Bloqueio */}
                      <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2">
                        <AlertTriangle
                          size={16}
                          className="text-red-500 flex-shrink-0 mt-0.5"
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-xs font-medium text-red-900 break-words whitespace-pre-wrap ${
                              !isExpanded && isLongText ? "line-clamp-2" : ""
                            }`}
                          >
                            {item.reason}
                          </p>
                          {isLongText && (
                            <button
                              onClick={() => toggleExpand(item.id)}
                              className="mt-1 text-[11px] font-bold text-red-700 inline-flex items-center gap-0.5"
                            >
                              {isExpanded ? (
                                <>Ver menos <ChevronUp size={12} /></>
                              ) : (
                                <>Ver completo <ChevronDown size={12} /></>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Botão de Resolução */}
                      <button
                        onClick={() => handleResolve(item)}
                        className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 active:scale-[0.99]"
                      >
                        Resolver Avaria <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* VERSÃO DESKTOP: Tabela Estruturada (oculta em mobile) */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed">
                    <thead className="bg-[#F7F8FF]">
                      <tr>
                        <th className="w-[34%] text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase">
                          Item
                        </th>
                        <th className="w-[42%] text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase">
                          Problema Identificado
                        </th>
                        <th className="w-[12%] text-left py-4 px-5 text-xs font-bold text-[#31358B] uppercase">
                          Data
                        </th>
                        <th className="w-[12%] text-right py-4 px-5 text-xs font-bold text-[#31358B] uppercase">
                          Ação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const isLongText = (item.reason || "").length > 120;
                        const isExpanded = !!expandedItems[item.id];

                        return (
                          <tr
                            key={item.id}
                            className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                          >
                            <td className="py-4 px-5 align-top">
                              <div className="flex items-start gap-3">
                                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {item.cover ? (
                                    <img
                                      src={item.cover}
                                      alt="Capa"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Package size={20} className="text-gray-400" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p
                                    className="font-bold text-[#04096D] text-sm truncate"
                                    title={item.title}
                                  >
                                    {item.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span
                                      className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                                        item.type === "GAME"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-orange-100 text-orange-700"
                                      }`}
                                    >
                                      {item.type === "GAME" ? "JOGO" : "CÓPIA"}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-gray-500">
                                      {item.code}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5 align-top">
                              <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex items-start gap-2.5">
                                <AlertTriangle
                                  size={16}
                                  className="text-red-500 flex-shrink-0 mt-0.5"
                                />
                                <div className="min-w-0 flex-1">
                                  <p
                                    className={`text-sm font-medium text-red-900 break-words whitespace-pre-wrap ${
                                      !isExpanded && isLongText ? "line-clamp-2" : ""
                                    }`}
                                  >
                                    {item.reason}
                                  </p>
                                  {isLongText && (
                                    <button
                                      onClick={() => toggleExpand(item.id)}
                                      className="mt-1.5 text-xs font-bold text-red-700 hover:text-red-900 inline-flex items-center gap-1 transition-colors"
                                    >
                                      {isExpanded ? (
                                        <>Ver menos <ChevronUp size={14} /></>
                                      ) : (
                                        <>Ver completo <ChevronDown size={14} /></>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-5 align-top">
                              <span className="text-xs sm:text-sm font-bold text-gray-600 block mt-1">
                                {new Date(item.date).toLocaleDateString("pt-BR")}
                              </span>
                            </td>

                            <td className="py-4 px-5 text-right align-top">
                              <button
                                onClick={() => handleResolve(item)}
                                className="bg-green-50 hover:bg-green-100 text-green-700 font-bold px-3.5 py-2 rounded-xl text-sm transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
                              >
                                Resolver <ArrowRight size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}