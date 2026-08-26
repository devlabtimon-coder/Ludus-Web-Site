import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail, KeyRound, Lock, Loader2 } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

interface ForgotPasswordProps {
  onBack: () => void;
}


export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Digite seu e-mail.");

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success(data.message || "Código enviado! Verifique seu e-mail.");
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao solicitar código.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return toast.error("O código deve ter 6 dígitos.");

    setIsLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgot-password/verify`, { email, code });
      setResetToken(data.resetToken);
      toast.success("Código validado com sucesso!");
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Código inválido ou expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres.");

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password/reset`, { resetToken, newPassword });
      toast.success("Senha alterada com sucesso! Faça login.");
      onBack(); 
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erro ao alterar a senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        
     
        <button 
          onClick={onBack}
          className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-[#31358B] transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o login
        </button>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#31358B]">
            {step === 1 && "Esqueceu sua senha?"}
            {step === 2 && "Verifique seu e-mail"}
            {step === 3 && "Crie uma nova senha"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 && "Digite seu e-mail e enviaremos um código de recuperação."}
            {step === 2 && `Enviamos um código de 6 dígitos para ${email}`}
            {step === 3 && "Sua nova senha deve ter no mínimo 6 caracteres."}
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-[#7b8199]" />
                <input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#dfe3f2] bg-[#fafbff] py-3 pl-10 pr-4 outline-none focus:border-[#FBBC04] focus:bg-white focus:ring-4 focus:ring-[#FBBC04]/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#31358B] font-bold text-white shadow-lg shadow-[#31358B]/20 transition-all hover:scale-[1.01] hover:bg-[#272b73] disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enviar código"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-5 w-5 text-[#7b8199]" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Código de 6 dígitos"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="h-14 w-full rounded-2xl border border-[#dfe3f2] bg-[#fafbff] py-3 pl-10 pr-4 text-center text-xl font-black tracking-widest outline-none focus:border-[#FBBC04] focus:bg-white focus:ring-4 focus:ring-[#FBBC04]/20"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#FBBC04] font-bold text-[#0A1F5C] shadow-lg shadow-[#FBBC04]/20 transition-all hover:scale-[1.01] hover:bg-[#e5ab00] disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Validar código"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-[#7b8199]" />
                <input
                  type="password"
                  placeholder="Sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-[#dfe3f2] bg-[#fafbff] py-3 pl-10 pr-4 outline-none focus:border-[#FBBC04] focus:bg-white focus:ring-4 focus:ring-[#FBBC04]/20"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || newPassword.length < 6}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#31358B] font-bold text-white shadow-lg shadow-[#31358B]/20 transition-all hover:scale-[1.01] hover:bg-[#272b73] disabled:opacity-60"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Salvar nova senha"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}