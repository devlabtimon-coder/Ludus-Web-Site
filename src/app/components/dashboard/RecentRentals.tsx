import { MoreVertical } from "lucide-react";
import { Avatar } from "../shared/Avatar";
import { Badge } from "../shared/Badge";

interface Rental {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  gameTitleSnapshot: string;
  user?: {
    name: string;
    email: string;
    avatar?: string | null;
    picture?: string | null;
  };
}

interface RecentRentalsProps {
  rentals: Rental[];
}

export function RecentRentals({ rentals }: RecentRentalsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusLabel = (rental: Rental): "Em Análise" | "Em Andamento" | "Atrasado" | "Concluído" => {
    const now = new Date();
    const endDate = new Date(rental.endDate);
    if (rental.status === "RETURNED" || rental.status === "CANCELED") return "Concluído";
    if (rental.status === "PENDING") return "Em Análise";
    if (rental.status === "ACTIVE") return now > endDate ? "Atrasado" : "Em Andamento";
    return "Em Análise";
  };

  const getAvatarColor = (email: string) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#95E1D3", "#FFE66D", "#A8E6CF", "#B8B8B8"];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!rentals || rentals.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Aluguéis Recentes</h2>
        <p className="text-gray-500 text-center py-8">Nenhum aluguel encontrado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-5">Aluguéis Recentes</h2>
      
      {/* Container com margin negativa no mobile para encostar nas bordas se precisar, 
          mas min-w-[600px] garante o scroll suave no touch */}
      <div className="overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 scrollbar-hide">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Jogo</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-2 sm:px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Info</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const avatarUrl = rental.user?.avatar || rental.user?.picture;
              return (
                <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={rental.user?.name || "Usuário"}
                        color={getAvatarColor(rental.user?.email || "default@email.com")}
                        src={avatarUrl}
                        size="sm"
                      />
                      <span className="font-bold text-sm text-gray-900 line-clamp-1 max-w-[120px] sm:max-w-none">
                        {rental.user?.name || "Usuário"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-sm font-medium text-gray-700">
                    <span className="line-clamp-1">{rental.gameTitleSnapshot}</span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-gray-500 text-xs font-semibold">
                    {formatDate(rental.startDate)}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4">
                    <Badge status={getStatusLabel(rental)} />
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-4 text-right">
                    <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors inline-flex">
                      <MoreVertical size={18} className="text-gray-400 hover:text-gray-700" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}