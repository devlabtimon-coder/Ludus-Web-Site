import { useEffect, useState } from 'react';
import { X, ShieldCheck, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminArea, User } from '../../../types/api';
import { ADMIN_AREAS } from '../../../config/adminAreas';
import { api, getErrorMessage } from '../../../services/api';

interface AdminAccessModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// Promove um aluno a admin ou muda as permissões de quem já é admin.
// Administrador geral acessa tudo e gerencia os admins; os demais, só as áreas marcadas.
export function AdminAccessModal({ user, isOpen, onClose, onSaved }: AdminAccessModalProps) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [areas, setAreas] = useState<AdminArea[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const promoting = user?.role !== 'ADMIN';

  useEffect(() => {
    if (!isOpen) return;
    setIsSuperAdmin(!!user?.isSuperAdmin);
    setAreas(user?.adminAreas ?? []);
    setError(null);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const toggleArea = (area: AdminArea) =>
    setAreas((current) => (current.includes(area) ? current.filter((a) => a !== area) : [...current, area]));

  const canSave = isSuperAdmin || areas.length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      await api.put(`/admin/users/${user.id}/admin-access`, { isSuperAdmin, areas: isSuperAdmin ? [] : areas });
      toast.success(promoting ? `${user.name} agora é admin.` : 'Permissões atualizadas.');
      onSaved();
      onClose();
    } catch (err) {
      // Ex.: reserva em andamento, conta bloqueada ou cadastro não aprovado.
      setError(getErrorMessage(err, 'Erro ao salvar o acesso de administrador.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 sm:p-0">
      <div className="bg-white w-full sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-black text-[#04096D]">{promoting ? 'Promover a admin' : 'Permissões de admin'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Fechar">
            <X className="text-gray-500" size={24} />
          </button>
        </div>

        <p className="text-sm font-semibold text-gray-500 mb-6">
          Usuário: <span className="text-[#04096D]">{user.name}</span>
        </p>

        <button
          type="button"
          onClick={() => setIsSuperAdmin((v) => !v)}
          aria-pressed={isSuperAdmin}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
            isSuperAdmin ? 'border-[#04096D] bg-[#04096D]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="p-3 rounded-xl bg-[#FBBC04]/15">
            <ShieldCheck className="text-[#9A6B00]" size={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#04096D]">Administrador geral</p>
            <p className="text-xs text-gray-500">Acesso a todas as áreas e gestão dos admins.</p>
          </div>
          <Checkmark checked={isSuperAdmin} />
        </button>

        {!isSuperAdmin && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-700">Áreas liberadas</p>
              <button
                type="button"
                onClick={() => setAreas(areas.length === ADMIN_AREAS.length ? [] : ADMIN_AREAS.map((a) => a.id))}
                className="text-xs font-bold text-[#31358B] hover:underline"
              >
                {areas.length === ADMIN_AREAS.length ? 'Desmarcar todas' : 'Marcar todas'}
              </button>
            </div>
            <div className="space-y-2">
              {ADMIN_AREAS.map((area) => {
                const checked = areas.includes(area.id);
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => toggleArea(area.id)}
                    aria-pressed={checked}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                      checked ? 'border-[#31358B] bg-[#31358B]/5' : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{area.label}</p>
                      <p className="text-xs text-gray-500">{area.pages}</p>
                    </div>
                    <Checkmark checked={checked} />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500">O Dashboard aparece para todo admin, com os blocos das áreas liberadas.</p>
          </div>
        )}

        {promoting && (
          <p className="mt-5 rounded-2xl bg-[#F7F8FF] px-4 py-3 text-xs text-gray-600">
            Admin não aluga jogos e sai do ranking. A pessoa entra no painel com o mesmo login do app.
          </p>
        )}

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className="w-full mt-6 flex items-center justify-center gap-2 bg-[#04096D] text-white py-4 rounded-2xl font-black text-[15px] hover:bg-[#070e99] active:scale-[0.98] transition-all shadow-lg shadow-[#04096D]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving && <Loader2 size={18} className="animate-spin" />}
          {promoting ? 'Promover a admin' : 'Salvar permissões'}
        </button>
        {!canSave && <p className="mt-2 text-center text-xs text-gray-500">Marque pelo menos uma área ou Administrador geral.</p>}
      </div>
    </div>
  );
}

function Checkmark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
        checked ? 'border-[#04096D] bg-[#04096D] text-white' : 'border-gray-300 bg-white'
      }`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </span>
  );
}
