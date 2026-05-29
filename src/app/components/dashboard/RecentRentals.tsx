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

  // Ajustado para incluir "Em Análise"
  const getStatusLabel = (
    rental: Rental,
  ): "Em Análise" | "Em Andamento" | "Atrasado" | "Concluído" => {
    const now = new Date();
    const endDate = new Date(rental.endDate);

    if (rental.status === "RETURNED" || rental.status === "CANCELED")
      return "Concluído";
    
    // Se está pendente, exibimos "Em Análise"
    if (rental.status === "PENDING") return "Em Análise";
    
    // Se está ativo, verificamos o atraso
    if (rental.status === "ACTIVE") {
      return now > endDate ? "Atrasado" : "Em Andamento";
    }
    
    return "Em Análise";
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#95E1D3",
      "#FFE66D",
      "#A8E6CF",
      "#B8B8B8",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!rentals || rentals.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Aluguéis Recentes
        </h2>
        <p className="text-gray-500 text-center py-8">
          Nenhum aluguel encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Aluguéis Recentes
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Usuário
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Jogo
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Data
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Ação
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const avatarUrl = rental.user?.avatar || rental.user?.picture;

              return (
                <tr
                  key={rental.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={rental.user?.name || "Usuário"}
                        color={getAvatarColor(
                          rental.user?.email || "default@email.com",
                        )}
                        src={avatarUrl}
                        size="sm"
                      />
                      <span className="font-medium text-gray-900">
                        {rental.user?.name || "Usuário"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-700">
                    {rental.gameTitleSnapshot}
                  </td>
                  <td className="py-4 px-4 text-gray-600 text-sm">
                    {formatDate(rental.startDate)}
                  </td>
                  <td className="py-4 px-4">
                    {/* O componente Badge precisa suportar "Em Análise" */}
                    <Badge status={getStatusLabel(rental)} />
                  </td>
                  <td className="py-4 px-4">
                    <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
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