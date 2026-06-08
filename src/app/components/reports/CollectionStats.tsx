import { Package, Download } from 'lucide-react';

interface CollectionStatsProps {
  available: number;
  rented: number;
  maintenance: number;
  total: number;
  occupancyRate: number;
}

export function CollectionStats({
  available,
  rented,
  maintenance,
  total,
  occupancyRate,
}: CollectionStatsProps) {
  const availablePercent = total > 0 ? ((available / total) * 100).toFixed(1) : '0.0';
  const rentedPercent = total > 0 ? ((rented / total) * 100).toFixed(1) : '0.0';
  const maintenancePercent = total > 0 ? ((maintenance / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Uso do Acervo</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700 transition-colors">
          <Download size={16} />
          Exportar
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Disponíveis</span>
            <span className="text-sm font-bold text-[#22C55E]">
              {availablePercent}% — {available} un.
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-[#22C55E] h-3 rounded-full transition-all" style={{ width: `${availablePercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Alugados</span>
            <span className="text-sm font-bold text-[#FBBC04]">
              {rentedPercent}% — {rented} un.
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-[#FBBC04] h-3 rounded-full transition-all" style={{ width: `${rentedPercent}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Em Manutenção</span>
            <span className="text-sm font-bold text-[#E62325]">
              {maintenancePercent}% — {maintenance} un.
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-[#E62325] h-3 rounded-full transition-all" style={{ width: `${maintenancePercent}%` }} />
          </div>
        </div>

        <div className="bg-[#FFF9E6] border border-[#FBBC04] rounded-lg p-4 text-center mt-6">
          <div className="flex items-center justify-center gap-2">
            <Package className="text-[#04096E]" size={24} />
            <p className="text-lg font-bold text-[#04096E]">
              Taxa de ocupação: {occupancyRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}   